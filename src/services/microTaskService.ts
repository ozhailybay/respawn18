import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  updateDoc, 
  serverTimestamp, 
  Timestamp,
  runTransaction,
  DocumentReference,
  writeBatch,
  CollectionReference,
  Query,
  DocumentData,
  QueryDocumentSnapshot,
  increment,
  deleteDoc,
  FieldValue
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  MicroTask, 
  MicroTaskApplication, 
  MicroTaskSubmission, 
  MicroTaskPayment,
  MicroTaskFilters,
  MicroTaskStatus,
  ApplicationStatus,
  SubmissionStatus,
  MicroTaskDispute,
  MicroTaskCategory
} from '../types';
import { auth } from '../firebase';
import { mockMicroTasks } from '../data/mockMicroTasks';

// Коллекции в Firestore
const MICRO_TASKS = 'microTasks';
const MICRO_TASK_APPLICATIONS = 'microTaskApplications';
const MICRO_TASK_SUBMISSIONS = 'microTaskSubmissions';
const MICRO_TASK_PAYMENTS = 'microTaskPayments';
const MICRO_TASK_DISPUTES = 'microTaskDisputes';
const USERS = 'users';

// Типы для документов в Firestore (с учетом особенностей Timestamp)
type MicroTaskDocument = Omit<MicroTask, 'id' | 'createdAt' | 'deadlineAt' | 'updatedAt'> & {
  createdAt: Timestamp;
  deadlineAt: Timestamp;
  updatedAt?: Timestamp;
  viewCount: number;
  applicationCount: number;
};

type MicroTaskApplicationDocument = Omit<MicroTaskApplication, 'id' | 'appliedAt'> & {
  appliedAt: Timestamp;
};

type MicroTaskSubmissionDocument = Omit<MicroTaskSubmission, 'id' | 'submittedAt'> & {
  submittedAt: Timestamp;
};

type MicroTaskPaymentDocument = Omit<MicroTaskPayment, 'id' | 'createdAt' | 'releasedAt' | 'refundedAt' | 'assigneeId'> & {
  createdAt: Timestamp;
  releasedAt?: Timestamp;
  refundedAt?: Timestamp;
  assigneeId: string | null;
};

// Константы для расчета комиссий и валидации
// В реальном приложении эти значения должны храниться в Firebase Remote Config
// или другом месте, позволяющем обновлять их без деплоя
const PLATFORM_FEE_PERCENT = 0.1; // 10%
const MIN_PLATFORM_FEE = 200; // KZT
const MAX_TAG_LENGTH = 30;
const MAX_TAGS_COUNT = 10;
const MIN_DEADLINE_HOURS = 24;
const MAX_DEADLINE_DAYS = 14;

/**
 * Получение процента комиссии платформы
 * В будущем можно подключить к Firebase Remote Config
 */
export function getPlatformFeePercent(): number {
  // TODO: Реализовать получение из Remote Config
  return PLATFORM_FEE_PERCENT;
}

/**
 * Получение минимальной комиссии платформы
 * В будущем можно подключить к Firebase Remote Config
 */
export function getMinPlatformFee(): number {
  // TODO: Реализовать получение из Remote Config
  return MIN_PLATFORM_FEE;
}

export class MicroTaskService {
  private tasksCollection = collection(db, MICRO_TASKS) as CollectionReference<MicroTaskDocument>;
  private applicationsCollection = collection(db, MICRO_TASK_APPLICATIONS) as CollectionReference<MicroTaskApplicationDocument>;
  private submissionsCollection = collection(db, MICRO_TASK_SUBMISSIONS) as CollectionReference<MicroTaskSubmissionDocument>;
  private paymentsCollection = collection(db, MICRO_TASK_PAYMENTS) as CollectionReference<MicroTaskPaymentDocument>;
  private disputesCollection = collection(db, MICRO_TASK_DISPUTES) as CollectionReference<MicroTaskDispute>;
  private usersCollection = collection(db, USERS) as CollectionReference<any>;

  /**
   * Создает новый микро-таск
   */
  async createMicroTask(taskData: Omit<MicroTask, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'viewCount' | 'applicationCount'>): Promise<string> {
    try {
      // Проверка авторизации
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Пользователь не авторизован');
      }

      // Проверка, что пользователь создает таск от своего имени
      if (currentUser.uid !== taskData.employerId) {
        throw new Error('Невозможно создать задание от имени другого пользователя');
      }

      // Проверка дедлайна
      const deadlineDate = new Date(taskData.deadlineAt);
      const now = new Date();
      const minDeadline = new Date(now.getTime() + MIN_DEADLINE_HOURS * 60 * 60 * 1000);
      const maxDeadline = new Date(now.getTime() + MAX_DEADLINE_DAYS * 24 * 60 * 60 * 1000);

      if (deadlineDate < minDeadline) {
        throw new Error(`Дедлайн должен быть не менее ${MIN_DEADLINE_HOURS} часов от текущего момента`);
      }

      if (deadlineDate > maxDeadline) {
        throw new Error(`Дедлайн должен быть не более ${MAX_DEADLINE_DAYS} дней от текущего момента`);
      }

      // Проверка тегов
      if (taskData.tags && taskData.tags.length > MAX_TAGS_COUNT) {
        throw new Error(`Максимальное количество тегов: ${MAX_TAGS_COUNT}`);
      }

      // Нормализация тегов
      const normalizedTags = taskData.tags 
        ? [...new Set(
            taskData.tags
              .map(tag => tag.trim().toLowerCase())
              .filter(tag => tag.length > 0 && tag.length <= MAX_TAG_LENGTH)
          )]
        : [];

      // Создаем микро-таск
      const taskRef = await addDoc(this.tasksCollection, {
        ...taskData,
        tags: normalizedTags,
        status: 'open',
        createdAt: serverTimestamp() as Timestamp,
        revisionCount: 0,
        deadlineAt: Timestamp.fromDate(new Date(taskData.deadlineAt)),
        viewCount: 0,
        applicationCount: 0
      });

      // Создаем запись о платеже (эскроу)
      await this.createPayment(taskData, taskRef.id);

      // Обновляем статистику пользователя
      const userRef = doc(this.usersCollection, taskData.employerId);
      await updateDoc(userRef, {
        'stats.tasksCreated': increment(1),
        'stats.totalSpent': increment(taskData.price)
      });

      console.log('Микро-задание создано с ID:', taskRef.id);
      return taskRef.id;
    } catch (error) {
      console.error('Error creating micro task:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Не удалось создать микро-задание');
    }
  }

  /**
   * Получает список открытых микро-тасков с фильтрацией
   */
  async listMicroTasks(
    filters: MicroTaskFilters, 
    pageSize = 20, 
    lastVisible?: QueryDocumentSnapshot<MicroTaskDocument>
  ): Promise<{ 
    tasks: MicroTask[], 
    lastVisible: QueryDocumentSnapshot<MicroTaskDocument> | null 
  }> {
    try {
      // В демонстрационных целях используем mock данные
      let filteredTasks = [...mockMicroTasks];
      
      // Применяем фильтры
      if (filters.onlyOpen) {
        filteredTasks = filteredTasks.filter(task => task.status === 'open');
      } else if (filters.status) {
        filteredTasks = filteredTasks.filter(task => task.status === filters.status);
      }
      
      if (filters.category) {
        filteredTasks = filteredTasks.filter(task => task.category === filters.category);
      }
      
      if (filters.maxPrice) {
        filteredTasks = filteredTasks.filter(task => task.price <= filters.maxPrice!);
      }
      
      if (filters.tags && filters.tags.length > 0) {
        filteredTasks = filteredTasks.filter(task => 
          filters.tags!.some(tag => task.tags.includes(tag))
        );
      }
      
      // Сортировка по дедлайну
      filteredTasks.sort((a, b) => {
        const aDeadline = new Date(a.deadlineAt);
        const bDeadline = new Date(b.deadlineAt);
        return aDeadline.getTime() - bDeadline.getTime();
      });
      
      // Пагинация
      const startIndex = 0; // В реальной реализации использовать lastVisible
      const endIndex = Math.min(startIndex + pageSize, filteredTasks.length);
      const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
      
      return {
        tasks: paginatedTasks,
        lastVisible: null // В mock данных не используем курсор
      };
    } catch (error) {
      console.error('Error listing micro tasks:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Не удалось получить список микро-заданий');
    }
  }

  /**
   * Получает детали микро-таска по ID
   */
  async getMicroTaskById(taskId: string): Promise<MicroTask | null> {
    try {
      // В демонстрационных целях используем mock данные
      const task = mockMicroTasks.find(t => t.id === taskId);
      
      if (!task) {
        return null;
      }
      
      // Увеличиваем счетчик просмотров (в реальной реализации обновить в базе)
      const taskWithIncrementedViews = {
        ...task,
        viewCount: task.viewCount + 1
      };
      
      return taskWithIncrementedViews;
    } catch (error) {
      console.error('Error getting micro task:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Не удалось получить детали микро-задания');
    }
  }

  /**
   * Отправляет заявку на микро-таск
   */
  async applyToMicroTask(application: Omit<MicroTaskApplication, 'id' | 'status' | 'appliedAt'>): Promise<string> {
    try {
      // Проверка авторизации
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Пользователь не авторизован');
      }

      // Проверка, что пользователь подает заявку от своего имени
      if (currentUser.uid !== application.applicantId) {
        throw new Error('Невозможно отправить заявку от имени другого пользователя');
      }

      // Проверяем, что таск существует и открыт
      const taskRef = doc(this.tasksCollection, application.microTaskId) as DocumentReference<MicroTaskDocument>;
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Микро-задание не найдено');
      }
      
      const taskData = taskDoc.data();
      if (taskData.status !== 'open') {
        throw new Error('Микро-задание не открыто для заявок');
      }
      
      // Проверяем, что подросток не является работодателем
      if (application.applicantId === taskData.employerId) {
        throw new Error('Вы не можете откликнуться на собственное задание');
      }
      
      // Проверяем, не отправлял ли уже заявку
      const existingApplicationsQuery = query(
        this.applicationsCollection,
        where('microTaskId', '==', application.microTaskId),
        where('applicantId', '==', application.applicantId)
      );
      
      const existingApplications = await getDocs(existingApplicationsQuery);
      if (!existingApplications.empty) {
        throw new Error('Вы уже откликнулись на это задание');
      }
      
      // Создаем заявку
      const applicationRef = await addDoc(this.applicationsCollection, {
        ...application,
        status: 'pending',
        appliedAt: serverTimestamp() as Timestamp
      });
      
      // Увеличиваем счетчик заявок
      await updateDoc(taskRef, {
        applicationCount: increment(1)
      });
      
      return applicationRef.id;
    } catch (error) {
      console.error('Error applying to micro task:', error);
      throw error;
    }
  }

  /**
   * Принимает заявку и назначает исполнителя
   */
  async assignMicroTask(taskId: string, applicationId: string, maxRetries = 3): Promise<void> {
    let retryCount = 0;
    let lastError;

    while (retryCount < maxRetries) {
      try {
        // Проверка авторизации
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('Пользователь не авторизован');
        }

        await runTransaction(db, async (transaction) => {
          // Получаем документы
          const taskRef = doc(this.tasksCollection, taskId) as DocumentReference<MicroTaskDocument>;
          const applicationRef = doc(this.applicationsCollection, applicationId) as DocumentReference<MicroTaskApplicationDocument>;
          
          const taskDoc = await transaction.get(taskRef);
          const applicationDoc = await transaction.get(applicationRef);
          
          if (!taskDoc.exists() || !applicationDoc.exists()) {
            throw new Error('Задание или заявка не найдены');
          }
          
          const taskData = taskDoc.data();
          const applicationData = applicationDoc.data();
          
          // Проверяем, что пользователь является работодателем
          if (currentUser.uid !== taskData.employerId) {
            throw new Error('Вы не являетесь автором этого задания');
          }

          // Проверяем, что таск открыт
          if (taskData.status !== 'open') {
            throw new Error('Задание не открыто для назначения');
          }
          
          // Проверяем, что заявка в статусе pending
          if (applicationData.status !== 'pending') {
            throw new Error('Заявка не находится в ожидании');
          }
          
          // Обновляем статус таска
          transaction.update(taskRef, {
            status: 'in_progress',
            assigneeId: applicationData.applicantId
          });
          
          // Обновляем статус заявки
          transaction.update(applicationRef, {
            status: 'accepted'
          });
          
          // Отклоняем все остальные заявки
          const otherApplicationsQuery = query(
            this.applicationsCollection,
            where('microTaskId', '==', taskId),
            where('status', '==', 'pending')
          );
          
          const otherApplicationsDocs = await getDocs(otherApplicationsQuery);
          
          otherApplicationsDocs.forEach((appDoc: QueryDocumentSnapshot<MicroTaskApplicationDocument>) => {
            if (appDoc.id !== applicationId) {
              const appRef = doc(this.applicationsCollection, appDoc.id);
              transaction.update(appRef, { status: 'rejected' });
            }
          });
        });
        
        // Если дошли сюда, транзакция успешна
        return;
      } catch (error) {
        lastError = error;
        retryCount++;
        
        if (retryCount < maxRetries) {
          // Ждем перед повторной попыткой
          await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
        }
      }
    }
    
    // Если все попытки неудачны, выбрасываем последнюю ошибку
    throw lastError;
  }

  /**
   * Отправляет результат выполнения задания
   */
  async submitMicroTask(submission: Omit<MicroTaskSubmission, 'id' | 'status' | 'submittedAt'>): Promise<string> {
    try {
      await runTransaction(db, async (transaction) => {
        // Получаем документ таска
        const taskRef = doc(this.tasksCollection, submission.microTaskId);
        const taskDoc = await transaction.get(taskRef);
        
        if (!taskDoc.exists()) {
          throw new Error('Micro task not found');
        }
        
        const taskData = taskDoc.data();
        
        // Проверяем, что таск в статусе in_progress
        if (taskData.status !== 'in_progress') {
          throw new Error('Task is not in progress');
        }
        
        // Проверяем, что отправитель является назначенным исполнителем
        if (taskData.assigneeId !== submission.submitterId) {
          throw new Error('You are not assigned to this task');
        }
        
        // Обновляем статус таска
        transaction.update(taskRef, {
          status: 'submitted'
        });
      });
      
      // Создаем документ с результатом
      const submissionRef = await addDoc(this.submissionsCollection, {
        ...submission,
        status: 'pending_review',
        submittedAt: serverTimestamp()
      });
      
      return submissionRef.id;
    } catch (error) {
      console.error('Error submitting micro task:', error);
      throw error;
    }
  }

  /**
   * Проверяет и принимает результат выполнения задания
   */
  async approveSubmission(taskId: string, submissionId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Получаем документы
      const taskRef = doc(this.tasksCollection, taskId);
      const submissionRef = doc(this.submissionsCollection, submissionId);
      
      const taskDoc = await getDoc(taskRef);
      const submissionDoc = await getDoc(submissionRef);
      
      if (!taskDoc.exists() || !submissionDoc.exists()) {
        throw new Error('Task or submission not found');
      }
      
      const taskData = taskDoc.data();
      const submissionData = submissionDoc.data();
      
      // Проверяем, что таск в статусе submitted
      if (taskData.status !== 'submitted') {
        throw new Error('Task is not submitted');
      }
      
      // Проверяем, что submission в статусе pending_review
      if (submissionData.status !== 'pending_review') {
        throw new Error('Submission is not pending review');
      }
      
      // Обновляем статус таска
      batch.update(taskRef, {
        status: 'completed'
      });
      
      // Обновляем статус submission
      batch.update(submissionRef, {
        status: 'approved'
      });
      
      // Обновляем статус платежа
      const paymentsRef = this.paymentsCollection;
      const paymentsQuery = query(
        paymentsRef,
        where('microTaskId', '==', taskId),
        where('status', '==', 'escrow')
      );
      
      const paymentsDocs = await getDocs(paymentsQuery);
      
      if (!paymentsDocs.empty) {
        const paymentRef = doc(paymentsRef, paymentsDocs.docs[0].id);
        batch.update(paymentRef, {
          status: 'released',
          releasedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Error approving submission:', error);
      throw error;
    }
  }

  /**
   * Запрашивает изменения в результате выполнения задания
   */
  async requestChanges(taskId: string, submissionId: string, feedback: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Получаем документы
      const taskRef = doc(this.tasksCollection, taskId);
      const submissionRef = doc(this.submissionsCollection, submissionId);
      
      const taskDoc = await getDoc(taskRef);
      const submissionDoc = await getDoc(submissionRef);
      
      if (!taskDoc.exists() || !submissionDoc.exists()) {
        throw new Error('Task or submission not found');
      }
      
      const taskData = taskDoc.data();
      
      // Проверяем, что таск в статусе submitted
      if (taskData.status !== 'submitted') {
        throw new Error('Task is not submitted');
      }
      
      // Увеличиваем счетчик ревизий
      const revisionCount = (taskData.revisionCount || 0) + 1;
      
      // Обновляем статус таска
      batch.update(taskRef, {
        status: 'in_progress',
        revisionCount
      });
      
      // Обновляем статус submission
      batch.update(submissionRef, {
        status: 'rejected',
        feedback
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error requesting changes:', error);
      throw error;
    }
  }

  /**
   * Отменяет микро-таск
   */
  async cancelMicroTask(taskId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Получаем документ таска
      const taskRef = doc(this.tasksCollection, taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Micro task not found');
      }
      
      const taskData = taskDoc.data();
      
      // Проверяем, что таск в статусе open
      if (taskData.status !== 'open') {
        throw new Error('Only open tasks can be cancelled');
      }
      
      // Обновляем статус таска
      batch.update(taskRef, {
        status: 'cancelled'
      });
      
      // Обновляем статус платежа
      const paymentsRef = this.paymentsCollection;
      const paymentsQuery = query(
        paymentsRef,
        where('microTaskId', '==', taskId),
        where('status', '==', 'escrow')
      );
      
      const paymentsDocs = await getDocs(paymentsQuery);
      
      if (!paymentsDocs.empty) {
        const paymentRef = doc(paymentsRef, paymentsDocs.docs[0].id);
        batch.update(paymentRef, {
          status: 'refunded',
          refundedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Error cancelling micro task:', error);
      throw error;
    }
  }

  /**
   * Получает список заявок на микро-таск
   */
  async getApplicationsForTask(taskId: string): Promise<MicroTaskApplication[]> {
    try {
      const applicationsRef = this.applicationsCollection;
      const applicationsQuery = query(
        applicationsRef,
        where('microTaskId', '==', taskId)
      );
      
      const snapshot = await getDocs(applicationsQuery);
      
      const applications: MicroTaskApplication[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        applications.push({
          id: doc.id,
          ...data,
          appliedAt: this.formatTimestamp(data.appliedAt)
        } as MicroTaskApplication);
      });
      
      return applications;
    } catch (error) {
      console.error('Error getting applications:', error);
      throw new Error('Failed to get applications');
    }
  }

  /**
   * Получает список заявок пользователя
   */
  async getUserApplications(userId: string): Promise<MicroTaskApplication[]> {
    try {
      const applicationsRef = this.applicationsCollection;
      const applicationsQuery = query(
        applicationsRef,
        where('applicantId', '==', userId)
      );
      
      const snapshot = await getDocs(applicationsQuery);
      
      const applications: MicroTaskApplication[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        applications.push({
          id: doc.id,
          ...data,
          appliedAt: this.formatTimestamp(data.appliedAt)
        } as MicroTaskApplication);
      });
      
      return applications;
    } catch (error) {
      console.error('Error getting user applications:', error);
      throw new Error('Failed to get user applications');
    }
  }

  /**
   * Получает список задач пользователя (как работодателя)
   * Поддерживает постраничную пагинацию
   */
  async getUserTasks(
    userId: string, 
    status?: MicroTaskStatus, 
    pageSize = 20,
    lastVisible?: QueryDocumentSnapshot<MicroTaskDocument>
  ): Promise<{ 
    tasks: MicroTask[], 
    lastVisible: QueryDocumentSnapshot<MicroTaskDocument> | null 
  }> {
    try {
      const tasksRef = this.tasksCollection;
      let tasksQuery: Query<MicroTaskDocument>;
      
      if (status) {
        tasksQuery = query(
          tasksRef,
          where('employerId', '==', userId),
          where('status', '==', status),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
      } else {
        tasksQuery = query(
          tasksRef,
          where('employerId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
      }

      // Если есть курсор, добавляем его
      if (lastVisible) {
        tasksQuery = query(tasksQuery, startAfter(lastVisible));
      }
      
      const snapshot = await getDocs(tasksQuery);
      
      const tasks: MicroTask[] = [];
      let newLastVisible: QueryDocumentSnapshot<MicroTaskDocument> | null = null;

      snapshot.docs.forEach((doc, index) => {
        if (index < pageSize) {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
            createdAt: this.formatTimestamp(data.createdAt),
            deadlineAt: this.formatTimestamp(data.deadlineAt)
        } as MicroTask);
        } else {
          newLastVisible = doc;
        }
      });
      
      return {
        tasks,
        lastVisible: newLastVisible || null
      };
    } catch (error) {
      console.error('Error getting user tasks:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Не удалось получить список заданий пользователя');
    }
  }

  /**
   * Получает список задач, назначенных пользователю (как исполнителю)
   */
  async getUserAssignedTasks(userId: string, status?: MicroTaskStatus): Promise<MicroTask[]> {
    try {
      const tasksRef = this.tasksCollection;
      let tasksQuery: Query;
      
      if (status) {
        tasksQuery = query(
          tasksRef,
          where('assigneeId', '==', userId),
          where('status', '==', status)
        );
      } else {
        tasksQuery = query(
          tasksRef,
          where('assigneeId', '==', userId)
        );
      }
      
      const snapshot = await getDocs(tasksQuery);
      
      const tasks: MicroTask[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: this.formatTimestamp(data.createdAt),
          deadlineAt: this.formatTimestamp(data.deadlineAt)
        } as MicroTask);
      });
      
      return tasks;
    } catch (error) {
      console.error('Error getting assigned tasks:', error);
      throw new Error('Failed to get assigned tasks');
    }
  }

  /**
   * Получает результат выполнения задания
   */
  async getSubmissionForTask(taskId: string): Promise<MicroTaskSubmission | null> {
    try {
      const submissionsRef = this.submissionsCollection;
      const submissionsQuery = query(
        submissionsRef,
        where('microTaskId', '==', taskId),
        limit(1)
      );
      
      const snapshot = await getDocs(submissionsQuery);
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        submittedAt: this.formatTimestamp(data.submittedAt)
      } as MicroTaskSubmission;
    } catch (error) {
      console.error('Error getting submission:', error);
      throw new Error('Failed to get submission');
    }
  }

// Вспомогательные функции

/**
 * Форматирует Timestamp из Firestore в Date или строку
 */
  formatTimestamp(timestamp: any): Date | string {
  if (!timestamp) {
    return new Date().toISOString();
  }
  
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  
  return timestamp;
}

/**
 * Рассчитывает комиссию платформы
 */
  calculatePlatformFee(price: number): number {
  // Используем функции для получения значений
  const fee = price * getPlatformFeePercent();
  return Math.max(fee, getMinPlatformFee());
} 

  // Новые методы для микрозаданий

  async updateMicroTask(taskId: string, updates: Partial<MicroTask>): Promise<void> {
    try {
      const taskRef = doc(this.tasksCollection, taskId);
      
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      console.log('Микро-задание обновлено:', taskId);
    } catch (error) {
      console.error('Ошибка при обновлении микро-задания:', error);
      throw error;
    }
  }

  async deleteMicroTask(taskId: string): Promise<void> {
    try {
      const taskRef = doc(this.tasksCollection, taskId);
      await deleteDoc(taskRef);

      console.log('Микро-задание удалено:', taskId);
    } catch (error) {
      console.error('Ошибка при удалении микро-задания:', error);
      throw error;
    }
  }

  async searchTasks(searchQuery: string): Promise<MicroTask[]> {
    try {
      const query = searchQuery.toLowerCase();
      return mockMicroTasks.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    } catch (error) {
      console.error('Ошибка при поиске заданий:', error);
      throw error;
    }
  }

  /**
   * Создаем запись о платеже (эскроу)
   */
  private async createPayment(taskData: any, taskId: string): Promise<void> {
    await addDoc(this.paymentsCollection, {
      microTaskId: taskId,
      employerId: taskData.employerId,
      assigneeId: null,
      amount: taskData.price,
      status: 'escrow',
      createdAt: serverTimestamp() as Timestamp,
      platformFee: this.calculatePlatformFee(taskData.price)
    });
  }
}

export const microTaskService = new MicroTaskService();
export default microTaskService; 
import React from 'react';
import { ShadowChatMessage as ShadowChatMessageType } from './types';

interface ShadowChatMessageProps {
  message: ShadowChatMessageType;
}

const ShadowChatMessage: React.FC<ShadowChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[75%]',
          isUser
            ? 'bg-white text-black'
            : 'border border-gray-700 bg-gray-900 text-gray-100',
        ].join(' ')}
      >
        {message.content}
      </div>
    </div>
  );
};

export default ShadowChatMessage;


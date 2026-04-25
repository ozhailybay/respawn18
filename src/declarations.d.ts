declare module 'react-syntax-highlighter' {
  import React from 'react';
  
  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export const Prism: React.ComponentType<SyntaxHighlighterProps>;
  const SyntaxHighlighter: React.ComponentType<SyntaxHighlighterProps>;
  export default SyntaxHighlighter;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const vscDarkPlus: any;
  export const darcula: any;
  export const dracula: any;
  export const okaidia: any;
  export const solarizedlight: any;
  export const tomorrow: any;
  export const twilight: any;
  export const prism: any;
  export const atomDark: any;
  export const base16AteliersulphurpoolLight: any;
  export const cb: any;
  export const coldarkCold: any;
  export const coldarkDark: any;
  export const coy: any;
  export const duotoneDark: any;
  export const duotoneEarth: any;
  export const duotoneForest: any;
  export const duotoneLight: any;
  export const duotoneSea: any;
  export const duotoneSpace: any;
  export const funky: any;
  export const ghcolors: any;
  export const hopscotch: any;
  export const materialDark: any;
  export const materialLight: any;
  export const materialOceanic: any;
  export const nord: any;
  export const pojoaque: any;
  export const shadesOfPurple: any;
  export const synthwave84: any;
  export const vs: any;
  export const xonokai: any;
}

declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      [key: string]: any;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: 'portrait' | 'landscape';
      [key: string]: any;
    };
    [key: string]: any;
  }

  interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance;
    from(element: HTMLElement): Html2PdfInstance;
    save(): Promise<void>;
    output(type: string, options?: any): Promise<any>;
    then(callback: (pdf: any) => void): Html2PdfInstance;
    catch(callback: (error: Error) => void): Html2PdfInstance;
  }

  function html2pdf(): Html2PdfInstance;
  function html2pdf(element: HTMLElement, options?: Html2PdfOptions): Promise<void>;

  export default html2pdf;
}

declare module 'react-syntax-highlighter';
declare module 'react-syntax-highlighter/dist/esm/styles/prism';

// Type declarations for libraries without TypeScript support

// Add missing IconBaseProps
import { IconType } from 'react-icons';
import { ChakraProps } from '@chakra-ui/react';

declare module 'react-icons/fi' {
  // Extend IconType to include ChakraProps
  export const FiAlertTriangle: IconType;
  export const FiCalendar: IconType;
  export const FiTag: IconType;
}

// Fix react-hook-form typing issues
declare module 'react-hook-form' {
  import { Path, PathValue } from 'react-hook-form';
  
  export type ControllerRenderProps<TFormValues extends Record<string, any> = Record<string, any>, TName extends string = string> = {
    onChange: (...event: any[]) => void;
    onBlur: () => void;
    value: any;
    name: string;
    ref: React.Ref<any>;
  };
} 
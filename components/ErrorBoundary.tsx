import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Произошла непредвиденная ошибка.";
      let errorDetails = this.state.error?.message;

      // Check if it's a Firestore error
      try {
        if (errorDetails && errorDetails.includes('operationType')) {
          const parsed = JSON.parse(errorDetails);
          if (parsed.error && parsed.error.includes('Missing or insufficient permissions')) {
            errorMessage = "У вас нет прав для выполнения этого действия.";
          } else {
            errorMessage = "Ошибка базы данных.";
          }
        }
      } catch (e) {
        // Not a JSON string, ignore
      }

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <AlertTriangle size={40} />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Упс! Что-то пошло не так</h1>
            <p className="text-gray-500 mb-6">{errorMessage}</p>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-transform active:scale-[0.98] flex items-center justify-center"
            >
              <RefreshCw size={18} className="mr-2" /> Обновить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

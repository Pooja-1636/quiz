import { useState, useEffect, useCallback, useRef } from 'react';

interface UseFullscreenGuardProps {
  maxViolations: number;
  onViolation: (count: number, reason: string) => void;
  onDisqualify: (reason: string) => void;
  isActive: boolean;
}

export const useFullscreenGuard = ({
  maxViolations,
  onViolation,
  onDisqualify,
  isActive
}: UseFullscreenGuardProps) => {
  const [violationCount, setViolationCount] = useState(0);
  const violationCountRef = useRef(0);

  const incrementViolation = useCallback((reason: string) => {
    const newCount = violationCountRef.current + 1;
    violationCountRef.current = newCount;
    setViolationCount(newCount);

    if (newCount >= maxViolations) {
      onDisqualify(reason);
    } else {
      onViolation(newCount, reason);
    }
  }, [maxViolations, onViolation, onDisqualify]);

  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error('Error attempting to enable full-screen mode:', err);
    }
  }, []);

  const handleFullscreenChange = useCallback(() => {
    if (!isActive) return;

    if (!document.fullscreenElement) {
      incrementViolation('Exited full-screen mode');
    }
  }, [isActive, incrementViolation]);

  const handleVisibilityChange = useCallback(() => {
    if (!isActive) return;

    if (document.visibilityState === 'hidden') {
      incrementViolation('Switched tabs or minimized window');
    }
  }, [isActive, incrementViolation]);

  const handleBlur = useCallback(() => {
    if (!isActive) return;
    
    // Small timeout to avoid double counting with visibilitychange
    setTimeout(() => {
      if (document.visibilityState === 'hidden' || !document.fullscreenElement) return;
      incrementViolation('Left the application window');
    }, 200);
  }, [isActive, incrementViolation]);

  useEffect(() => {
    if (!isActive) return;

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    // Prevent copy, paste, and right-click
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener('copy', preventDefault);
    document.addEventListener('paste', preventDefault);
    document.addEventListener('contextmenu', preventDefault);

    // Prevent some common keyboard shortcuts (like Alt+Tab, though browser might block this)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.altKey && e.key === 'Tab') || 
        (e.metaKey && e.key === 'Tab') ||
        (e.key === 'F12') ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        // We can't actually prevent Alt+Tab in most browsers, but we can detect the blur it causes.
        // We can prevent F12 or Ctrl+Shift+I in some cases.
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', preventDefault);
      document.removeEventListener('paste', preventDefault);
      document.removeEventListener('contextmenu', preventDefault);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, handleFullscreenChange, handleVisibilityChange, handleBlur]);

  return { violationCount, enterFullscreen };
};

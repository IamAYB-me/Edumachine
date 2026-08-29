import { motion, type Variants, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils';

// ── Variants ────────────────────────────────────────────────────────────────

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.35,
      ease: 'easeOut',
    },
  }),
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.06,
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  }),
};

export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

// ── Page Wrapper ────────────────────────────────────────────────────────────

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

// ── Stagger Container ───────────────────────────────────────────────────────

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ children, className, staggerDelay = 0.06 }: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

// ── Stagger Item ────────────────────────────────────────────────────────────

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fadeUp' | 'fadeIn' | 'scaleIn' | 'slideLeft';
}

export function StaggerItem({ children, className, variant = 'fadeUp' }: StaggerItemProps) {
  const variants = {
    fadeUp: fadeUpVariants,
    fadeIn: fadeInVariants,
    scaleIn: scaleInVariants,
    slideLeft: slideInLeftVariants,
  };

  return (
    <motion.div variants={variants[variant]} className={cn(className)}>
      {children}
    </motion.div>
  );
}

// ── Animated Button ─────────────────────────────────────────────────────────

type AnimatedButtonProps = HTMLMotionProps<'button'> & {
  children: React.ReactNode;
  className?: string;
};

export function AnimatedButton({ children, className, ...props }: AnimatedButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// ── Animated Progress Bar ───────────────────────────────────────────────────

interface AnimatedProgressProps {
  value: number;
  colorClass?: string;
  className?: string;
  height?: string;
}

export function AnimatedProgress({ value, colorClass = 'bg-blue-500', className, height = 'h-2' }: AnimatedProgressProps) {
  return (
    <div className={cn('w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden', height, className)}>
      <motion.div
        className={cn('h-full rounded-full', colorClass)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
      />
    </div>
  );
}

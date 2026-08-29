import { motion, type Variants } from 'framer-motion';
import { cn } from '@/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  noEntrance?: boolean;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export function AnimatedCard({ children, className, delay = 0, noEntrance = false }: AnimatedCardProps) {
  return (
    <motion.div
      initial={noEntrance ? false : 'hidden'}
      animate={noEntrance ? undefined : 'visible'}
      custom={delay}
      variants={noEntrance ? undefined : cardVariants}
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function IntroScreen({ onComplete }) {
  const [shouldExit, setShouldExit] = useState(false);

  useEffect(() => {
    // Após 4s, inicia o fade out
    const timer = setTimeout(() => {
      setShouldExit(true);
      setTimeout(() => {
        onComplete();
      }, 800);
    }, 4000);

    // Permite pular com ESC ou clique
    const handleSkip = (e) => {
      if (e.key === 'Escape' || e.type === 'click') {
        clearTimeout(timer);
        setShouldExit(true);
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    };

    window.addEventListener('keydown', handleSkip);
    document.addEventListener('click', handleSkip);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleSkip);
      document.removeEventListener('click', handleSkip);
    };
  }, [onComplete]);

  // Variantes de animação para o container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.8 }
    }
  };

  // Variantes para os paths do SVG - fade in limpo, sem efeito de desenho
  const pathVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  // Variantes para o círculo preenchido
  const circleVariants = {
    hidden: {
      scale: 0.5,
      opacity: 0
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Variantes para o glow
  const glowVariants = {
    hidden: {
      scale: 0.8,
      opacity: 0
    },
    visible: {
      scale: [1, 1.4, 1],
      opacity: [0, 0.8, 0],
      transition: {
        duration: 2,
        ease: "easeInOut",
        times: [0, 0.5, 1]
      }
    }
  };

  // Variantes para o hint
  const hintVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 0.6,
      y: 0,
      transition: {
        delay: 2.5,
        duration: 1
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={shouldExit ? "exit" : "visible"}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        cursor: 'pointer'
      }}
    >
      <motion.div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '40px'
        }}
      >
        {/* Logo SVG com animação */}
        <motion.svg
          viewBox="0 0 200 200"
          width="240"
          height="240"
          style={{
            filter: 'drop-shadow(0 0 30px rgba(0, 188, 212, 0.6))'
          }}
        >
          {/* Glow de fundo */}
          <motion.circle
            cx="100"
            cy="115"
            r="35"
            fill="none"
            stroke="#00bcd4"
            strokeWidth="3"
            variants={glowVariants}
          />

          {/* Arco esquerdo */}
          <motion.path
            d="M 60,80 A 50,50 0 0,0 40,130"
            fill="none"
            stroke="#00bcd4"
            strokeWidth="8"
            strokeLinecap="round"
            variants={pathVariants}
          />
          
          {/* Arco direito */}
          <motion.path
            d="M 160,130 A 50,50 0 0,0 140,80"
            fill="none"
            stroke="#00bcd4"
            strokeWidth="8"
            strokeLinecap="round"
            variants={pathVariants}
          />
          
          {/* Arco inferior */}
          <motion.path
            d="M 40,130 A 60,60 0 0,0 160,130"
            fill="none"
            stroke="#00bcd4"
            strokeWidth="8"
            strokeLinecap="round"
            variants={pathVariants}
          />
          
          {/* Linha vertical central */}
          <motion.line
            x1="100"
            y1="30"
            x2="100"
            y2="115"
            stroke="#00bcd4"
            strokeWidth="8"
            strokeLinecap="round"
            variants={pathVariants}
          />
          
          {/* Círculo central */}
          <motion.circle
            cx="100"
            cy="115"
            r="20"
            fill="none"
            stroke="#00bcd4"
            strokeWidth="8"
            variants={pathVariants}
          />
          
          {/* Círculo interno preenchido */}
          <motion.circle
            cx="100"
            cy="115"
            r="8"
            fill="#00bcd4"
            variants={circleVariants}
          />
        </motion.svg>

        {/* Hint de pular */}
        <motion.div
          variants={hintVariants}
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9em',
            textAlign: 'center'
          }}
        >
          Clique ou pressione ESC para pular
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

import { useEffect, useState } from 'react';

export default function IntroScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Após 3.5s, inicia o fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Após fade out completo (0.8s), chama o callback
      setTimeout(() => {
        onComplete();
      }, 800);
    }, 3500);

    // Permite pular com ESC ou clique
    const handleSkip = (e) => {
      if (e.key === 'Escape' || e.type === 'click') {
        clearTimeout(timer);
        setIsVisible(false);
        setTimeout(() => {
          onComplete();
        }, 800);
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

  if (!isVisible) {
    return (
      <div className="intro-fadeout">
        <div className="intro-container">
          <svg className="intro-logo" viewBox="0 0 200 200" width="200" height="200">
            {/* Arco esquerdo */}
            <path
              className="intro-arc intro-arc-left"
              d="M 60,80 A 50,50 0 0,0 40,130"
              fill="none"
              stroke="#00bcd4"
              strokeWidth="8"
              strokeLinecap="round"
            />
            
            {/* Arco direito */}
            <path
              className="intro-arc intro-arc-right"
              d="M 160,130 A 50,50 0 0,0 140,80"
              fill="none"
              stroke="#00bcd4"
              strokeWidth="8"
              strokeLinecap="round"
            />
            
            {/* Arco inferior (completa o círculo externo) */}
            <path
              className="intro-arc intro-arc-bottom"
              d="M 40,130 A 60,60 0 0,0 160,130"
              fill="none"
              stroke="#00bcd4"
              strokeWidth="8"
              strokeLinecap="round"
            />
            
            {/* Linha vertical central */}
            <line
              className="intro-line intro-line-vertical"
              x1="100"
              y1="30"
              x2="100"
              y2="115"
              stroke="#00bcd4"
              strokeWidth="8"
              strokeLinecap="round"
            />
            
            {/* Círculo central */}
            <circle
              className="intro-circle"
              cx="100"
              cy="115"
              r="20"
              fill="none"
              stroke="#00bcd4"
              strokeWidth="8"
            />
            
            {/* Círculo interno menor (preenchido) */}
            <circle
              className="intro-circle-inner"
              cx="100"
              cy="115"
              r="8"
              fill="#00bcd4"
            />

            {/* Glow effect */}
            <circle
              className="intro-glow"
              cx="100"
              cy="115"
              r="28"
              fill="none"
              stroke="#00bcd4"
              strokeWidth="2"
              opacity="0"
            />
          </svg>
        </div>
        <style jsx>{`
          .intro-fadeout {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeOut 0.8s ease-out forwards;
            pointer-events: none;
          }

          @keyframes fadeOut {
            to {
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="intro-screen">
      <div className="intro-container">
        <svg className="intro-logo" viewBox="0 0 200 200" width="200" height="200">
          {/* Arco esquerdo */}
          <path
            className="intro-arc intro-arc-left"
            d="M 60,80 A 50,50 0 0,0 40,130"
            fill="none"
            stroke="#00bcd4"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Arco direito */}
          <path
            className="intro-arc intro-arc-right"
            d="M 160,130 A 50,50 0 0,0 140,80"
            fill="none"
            stroke="#00bcd4"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Arco inferior (completa o círculo externo) */}
          <path
            className="intro-arc intro-arc-bottom"
            d="M 40,130 A 60,60 0 0,0 160,130"
            fill="none"
            stroke="#00bcd4"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Linha vertical central */}
          <line
            className="intro-line intro-line-vertical"
            x1="100"
            y1="30"
            x2="100"
            y2="115"
            stroke="#00bcd4"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Círculo central */}
          <circle
            className="intro-circle"
            cx="100"
            cy="115"
            r="20"
            fill="none"
            stroke="#00bcd4"
            strokeWidth="8"
          />
          
          {/* Círculo interno menor (preenchido) */}
          <circle
            className="intro-circle-inner"
            cx="100"
            cy="115"
            r="8"
            fill="#00bcd4"
          />

          {/* Glow effect */}
          <circle
            className="intro-glow"
            cx="100"
            cy="115"
            r="28"
            fill="none"
            stroke="#00bcd4"
            strokeWidth="2"
            opacity="0"
          />
        </svg>

        <div className="intro-skip-hint">Clique ou pressione ESC para pular</div>
      </div>

      <style jsx>{`
        .intro-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          cursor: pointer;
        }

        .intro-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
        }

        .intro-logo {
          filter: drop-shadow(0 0 20px rgba(0, 188, 212, 0.5));
        }

        .intro-skip-hint {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.9em;
          animation: fadeInSlow 2s ease-in forwards;
          animation-delay: 2s;
          opacity: 0;
        }

        /* Animação dos arcos laterais */
        .intro-arc {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawArc 1s ease-out forwards;
        }

        .intro-arc-left {
          animation-delay: 0.2s;
        }

        .intro-arc-right {
          animation-delay: 0.4s;
        }

        .intro-arc-bottom {
          stroke-dasharray: 188;
          stroke-dashoffset: 188;
          animation: drawArc 1.2s ease-out forwards;
          animation-delay: 0.6s;
        }

        /* Animação da linha vertical */
        .intro-line-vertical {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawLine 0.8s ease-out forwards;
          animation-delay: 1s;
        }

        /* Animação do círculo central */
        .intro-circle {
          stroke-dasharray: 126;
          stroke-dashoffset: 126;
          animation: drawCircle 0.8s ease-out forwards;
          animation-delay: 1.6s;
        }

        /* Animação do círculo interno */
        .intro-circle-inner {
          opacity: 0;
          animation: fadeIn 0.4s ease-out forwards;
          animation-delay: 2.2s;
        }

        /* Animação do glow */
        .intro-glow {
          animation: pulse 1.5s ease-in-out forwards;
          animation-delay: 2.4s;
        }

        @keyframes drawArc {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes drawCircle {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInSlow {
          to {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0% {
            opacity: 0;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.3);
          }
          100% {
            opacity: 0;
            transform: scale(1.8);
          }
        }
      `}</style>
    </div>
  );
}

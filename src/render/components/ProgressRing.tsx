// import React from 'react'

interface Props {
  radius: number
  stroke: number
  progress: number
}

import React from 'react';

const ProgressRing = ({radius, stroke, progress}: Props) => {

  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - progress / 100 * circumference;
  

  return (
  <svg
        height={radius * 2}
        width={radius * 2}
       >
        <circle
          stroke="white"
          fill="transparent"
          strokeWidth={ stroke }
          strokeLinecap='round'
          strokeDasharray={ circumference + ' ' + circumference }
          style={ { strokeDashoffset } }
          r={ normalizedRadius }
          cx={ radius }
          cy={ radius }
         />
      </svg>
  );
};

export default ProgressRing
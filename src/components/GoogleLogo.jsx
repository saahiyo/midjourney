import * as React from "react";

const SVGComponent = (props) => (
  <svg
    aria-hidden="true"
    height={28}
    width={28}
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    {...props}
  >
    <clipPath id="_GGfGaLrXAq-Bvr0Ph_CGgQ0_1">
      <path d="M12 10v4.5h6.47c-.5 2.7-3 4.74-6.47 4.74-3.9 0-7.1-3.3-7.1-7.25S8.1 4.75 12 4.75c1.8 0 3.35.6 4.6 1.8l3.4-3.4C18 1.2 15.24 0 12 0 5.4 0 0 5.4 0 12s5.4 12 12 12c7 0 11.5-4.9 11.5-11.7 0-.8-.1-1.54-.2-2.3H12z" />
    </clipPath>
    <filter id="_GGfGaLrXAq-Bvr0Ph_CGgQ0_2">
      <feGaussianBlur stdDeviation={1} />
    </filter>
    <g
      style={{
        clipPath: "url(#_GGfGaLrXAq-Bvr0Ph_CGgQ0_1)",
      }}
    >
      <foreignObject
        style={{
          filter: "url(#_GGfGaLrXAq-Bvr0Ph_CGgQ0_2)",
        }}
        height={28}
        transform="translate(-2,-2)"
        width={28}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background:
              "conic-gradient(\n        #FF4641,\n        #FD5061 40deg,\n        #FD5061 60deg,\n        #3186FF 85deg,\n        #3186FF 117deg,\n        #00A5B7 142deg,\n        #0EBC5F 167deg,\n        #0EBC5F 200deg,\n        #6CC500 226deg,\n        #FFCC00 253deg,\n        #FFD314 268deg,\n        #FFCC00 292deg,\n        #FF4641 327deg\n      )",
          }}
        />
      </foreignObject>
      <rect fill="#3186FF" height={8} width={16} x={11} y={8} />
    </g>
  </svg>
);

export default SVGComponent;
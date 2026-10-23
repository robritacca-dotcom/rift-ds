import React from "react";

/* The publishers and identity providers a template names as data get their
   real marks in brand colour (an inherently off-token exception, like the
   case-study cover redraws); X and Apple ride currentColor because their
   marks are monochrome by design. One table, read by the marketing
   dashboard's channel column and the sign-in template's provider buttons,
   so a provider is drawn the same wherever a screen names it. Material
   Symbols carries no brand glyphs, which is why these are inline SVG at
   all; the library's icon props accept a ReactNode for exactly this case. */
export const PUBLISHER_MARKS: Record<
  string,
  { viewBox: string; paths: { d: string; fill?: string }[] }
> = {
  google: {
    viewBox: "0 0 48 48",
    paths: [
      {
        fill: "#EA4335",
        d: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z",
      },
      {
        fill: "#4285F4",
        d: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z",
      },
      {
        fill: "#FBBC05",
        d: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z",
      },
      {
        fill: "#34A853",
        d: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z",
      },
    ],
  },
  meta: {
    viewBox: "0 0 16 16",
    paths: [
      {
        fill: "#0081FB",
        d: "M8.217 5.243C9.145 3.988 10.171 3 11.483 3 13.96 3 16 6.153 16.001 9.907c0 2.29-.986 3.725-2.757 3.725-1.543 0-2.395-.866-3.924-3.424l-.667-1.123a123 123 0 0 0-.648-1.074l-1.178 2.08c-1.673 2.925-2.615 3.541-3.923 3.541C1.086 13.632 0 12.217 0 9.973 0 6.388 1.995 3 4.598 3q.477-.001.924.122c.31.086.611.22.913.407.577.359 1.154.915 1.782 1.714m1.516 2.224q.378.61.788 1.316l.523.882c.936 1.587 1.313 1.918 1.9 1.918.586 0 .87-.482.87-1.42 0-2.834-1.253-5.02-2.35-5.02-.579 0-1.09.412-1.731 1.324m-4.855-1.14c-1.204 0-2.24 2.098-2.24 4.288 0 1.101.353 1.735 1.06 1.735.68 0 1.096-.417 2.278-2.4l.943-1.585c-.928-1.417-1.399-2.038-2.041-2.038",
      },
    ],
  },
  x: {
    viewBox: "0 0 16 16",
    paths: [
      {
        d: "M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z",
      },
    ],
  },
  linkedin: {
    viewBox: "0 0 16 16",
    paths: [
      {
        fill: "#0A66C2",
        d: "M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z",
      },
    ],
  },
  facebook: {
    viewBox: "0 0 24 24",
    paths: [
      {
        fill: "#0866FF",
        d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
      },
    ],
  },
  apple: {
    viewBox: "0 0 24 24",
    paths: [
      {
        d: "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701",
      },
    ],
  },
};

/**
 * One publisher's mark, `aria-hidden` because the text beside it already
 * names the brand. Without `size` the svg takes its box from the slot it
 * sits in (a Button's icon slot sizes its svg); with it, the box is fixed.
 */
export function PublisherMark({
  id,
  size,
  className,
}: {
  id: string;
  size?: number;
  className?: string;
}) {
  const mark = PUBLISHER_MARKS[id];
  if (!mark) return null;
  return (
    <svg
      className={className}
      viewBox={mark.viewBox}
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      {mark.paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.fill} />
      ))}
    </svg>
  );
}

declare module 'save-svg-as-png' {
  export function svgAsPngUri(
    element: SVGSVGElement,
    options: {scale: number; excludeCss: boolean},
  ): Promise<string>;
}

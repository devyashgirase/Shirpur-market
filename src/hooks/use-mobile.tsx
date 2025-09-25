import * as React from "react"

// Enhanced breakpoints for better responsive design
const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  large: 1280,
  xlarge: 1536
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.mobile)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < BREAKPOINTS.mobile)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS.mobile}px) and (max-width: ${BREAKPOINTS.desktop - 1}px)`)
    const onChange = () => {
      const width = window.innerWidth
      setIsTablet(width >= BREAKPOINTS.mobile && width < BREAKPOINTS.desktop)
    }
    mql.addEventListener("change", onChange)
    const width = window.innerWidth
    setIsTablet(width >= BREAKPOINTS.mobile && width < BREAKPOINTS.desktop)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isTablet
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS.desktop}px)`)
    const onChange = () => {
      setIsDesktop(window.innerWidth >= BREAKPOINTS.desktop)
    }
    mql.addEventListener("change", onChange)
    setIsDesktop(window.innerWidth >= BREAKPOINTS.desktop)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isDesktop
}

export function useScreenSize() {
  const [screenSize, setScreenSize] = React.useState<{
    width: number
    height: number
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
  }>({ width: 0, height: 0, isMobile: false, isTablet: false, isDesktop: false })

  React.useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setScreenSize({
        width,
        height,
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.desktop,
        isDesktop: width >= BREAKPOINTS.desktop
      })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return screenSize
}

export { BREAKPOINTS }
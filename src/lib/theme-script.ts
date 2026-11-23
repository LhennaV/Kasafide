/**
 * Runs in <head> before first paint (see layout.tsx). Public pages follow the device's
 * light/dark setting; inside the portal (/module/...) a choice saved by ThemeToggle wins.
 * SystemTheme.tsx keeps this in step after client-side navigation and device changes.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var d=document.documentElement,s=null;if(location.pathname.indexOf('/module/')===0){s=localStorage.getItem('kf_theme');}d.setAttribute('data-theme',s==='light'||s==='dark'?s:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'));}catch(e){}})();`

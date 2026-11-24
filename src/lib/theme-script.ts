/**
 * Runs in <head> before first paint (see layout.tsx). Public pages follow the device's
 * light/dark setting; inside the portal (/module/...) a choice saved by ThemeToggle wins.
 * SystemTheme.tsx keeps this in step after client-side navigation and device changes.
 */
export const THEME_INIT_SCRIPT = `(function(){
  try{
    var d=document.documentElement,s=null;
    if(location.pathname.indexOf('/module/')===0){s=localStorage.getItem('kf_theme');}
    d.setAttribute('data-theme',s==='light'||s==='dark'?s:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'));
  }catch(e){}
  try{
    var ignorePatterns=['The children should not have changed if we pass in the same set','updateFiberRecursively','updateVirtualChildrenRecursively'];
    var ce=console.error;
    console.error=function(){
      var str='';
      for(var i=0;i<arguments.length;i++){
        str+=' '+(arguments[i]?(arguments[i].message||arguments[i].stack||arguments[i]):'');
      }
      for(var j=0;j<ignorePatterns.length;j++){
        if(str.indexOf(ignorePatterns[j])!==-1)return;
      }
      ce.apply(console,arguments);
    };
    window.addEventListener('error',function(e){
      var msg=(e&&(e.message||(e.error&&e.error.message)))||'';
      for(var k=0;k<ignorePatterns.length;k++){
        if(msg.indexOf(ignorePatterns[k])!==-1){
          if(e.stopImmediatePropagation)e.stopImmediatePropagation();
          if(e.preventDefault)e.preventDefault();
          return true;
        }
      }
    },true);
  }catch(e){}
})();`

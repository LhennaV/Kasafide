/**
 * Runs in <head> before first paint (see layout.tsx). Every page follows the device's light/dark
 * setting unless the person picked Light or Dark in Account Settings → Appearance (ThemeSetting).
 * SystemTheme.tsx keeps this in step after navigation, device changes and a new choice.
 *
 * The key is new on purpose: the old header button saved 'kf_theme', and ignoring it puts
 * everyone back on System default.
 */
export const THEME_KEY = 'kf_theme_pref'
export const THEME_EVENT = 'kf-theme-change'

export const THEME_INIT_SCRIPT = `(function(){
  try{
    var d=document.documentElement,s=localStorage.getItem('${THEME_KEY}');
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

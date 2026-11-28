/* Pure coastal badge ladder: one badge per five verified island stars. */
(function(root){
  'use strict';
  function unlockedBadges(stars){
    const value=Number(stars);
    if(!Number.isFinite(value)) return 0;
    return Math.max(0,Math.min(10,Math.floor(value/5)));
  }
  root.MEJCoastalUnlockedBadges=unlockedBadges;
  if(typeof module!=='undefined'&&module.exports) module.exports={unlockedBadges};
})(globalThis);

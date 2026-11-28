/* Pure badge ladder and legacy-star conversion helpers. */
(function(root){
  'use strict';
  function unlockedBadges(stars){
    const value=Number(stars);
    if(!Number.isFinite(value)) return 0;
    return Math.max(0,Math.min(10,Math.floor(value/5)));
  }
  // Mirrors 20261128143000_migrate_legacy_island_stars_div4.sql.
  // Missing/null stars use the legacy mastered*2 estimate before conversion.
  function migrateLegacyStars(oldStars, mastered){
    const parse=value=>{
      if(value===null||value===undefined||value==='') return null;
      const n=Number(value);
      return Number.isFinite(n)?n:null;
    };
    const source=parse(oldStars);
    const legacyMastered=parse(mastered);
    const oldScale=source===null?(legacyMastered===null?0:legacyMastered*2):source;
    return Math.max(0,Math.min(50,Math.floor(oldScale/4)));
  }
  root.MEJCoastalUnlockedBadges=unlockedBadges;
  root.MEJMigrateLegacyIslandStars=migrateLegacyStars;
  if(typeof module!=='undefined'&&module.exports) module.exports={unlockedBadges,migrateLegacyStars};
})(globalThis);

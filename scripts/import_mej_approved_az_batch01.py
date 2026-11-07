"""Import the user-approved exact 16 PNG cards from a single ZIP without quality loss."""
from pathlib import Path
import csv, io, re, shutil, struct, zipfile, json

root=Path(__file__).resolve().parents[1]
manifest=root/'reviews/MEJ_AZ_Approved_Batch01_16.csv'
archive=root/'assets/import/MEJ_4x4_16_384px_Equal_Crops.zip'
if not archive.exists():
    raise SystemExit('Approved ZIP not present yet. No app files changed.')
rows=list(csv.DictReader(manifest.open(encoding='utf-8')))
assert len(rows)==16 and all(x['approved']=='yes' for x in rows)
out=root/'assets/mej-az-approved-01'
out.mkdir(parents=True,exist_ok=True)
def dims(raw):
    assert raw[:8]==b'\x89PNG\r\n\x1a\n','Not PNG'
    return struct.unpack('>II',raw[16:24])
with zipfile.ZipFile(archive) as z:
    for row in rows:
        name=row['original_file']
        assert re.fullmatch(r'[0-9]{2}_[a-z_]+\.png',name)
        raw=z.read(name)
        assert dims(raw)==(384,384),(name,dims(raw))
        (out/name).write_bytes(raw)
items=[{'key':x['word'],'file':x['original_file'],'id':130000+i} for i,x in enumerate(rows)]
js="""/* MEJ approved 4x4 vocabulary batch 01; all 16 original PNGs, 384x384. */
(()=>{
const root = new URL('./mej-az-approved-01/',document.currentScript.src);
window.MEJ_APPROVED_IMAGES=window.MEJ_APPROVED_IMAGES||{};
const manifest = """+json.dumps(items,ensure_ascii=False,separators=(',',':'))+""";
for(const x of manifest){
 const image={id:x.id,w:384,h:384,preferred:true,src:new URL(x.file,root).href,status:'approved'};
 const old=window.MEJ_APPROVED_IMAGES[x.key]||[];
 window.MEJ_APPROVED_IMAGES[x.key]=[image,...(Array.isArray(old)?old:[old])];
}
})();
"""
(root/'assets/approved-images-13.js').write_text(js,encoding='utf-8')
index=root/'index.html'
s=index.read_text(encoding='utf-8')
marker='<script defer src="./assets/approved-images-12.js?v=20261104-approved"></script>'
new=marker+'\n<script defer src="./assets/approved-images-13.js?v=20261107-az01"></script>'
assert marker in s
if 'approved-images-13.js' not in s:
    index.write_text(s.replace(marker,new,1),encoding='utf-8')
learning=root/'reviews/learning.html'
s=learning.read_text(encoding='utf-8')
assert 'for(let i=1;i<=12;i++)' in s or 'for(let i=1;i<=13;i++)' in s
s=s.replace('for(let i=1;i<=12;i++)','for(let i=1;i<=13;i++)')
learning.write_text(s,encoding='utf-8')
sw=root/'sw.js'
s=sw.read_text(encoding='utf-8')
cache=re.search(r"const CACHE='([^']+)'",s)
assert cache
if cache.group(1).endswith('az01'):
    pass
else:
    s=s.replace(cache.group(0), "const CACHE='mej-vocab-approved-az01'")
sw.write_text(s,encoding='utf-8')
print('IMPORTED_USER_APPROVED_FULL_RESOLUTION_IMAGE_FILES',len(rows),'and linked to app + review')

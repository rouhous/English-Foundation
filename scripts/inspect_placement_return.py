from pathlib import Path
s=Path('index.html').read_text(encoding='utf-8').splitlines()
ranges=[(1490,1515),(1658,1675),(1920,2020),(2400,2490),(len(s)-50,len(s))]
o=[]
for a,b in ranges:
    o.append(f'### LINES {a}-{b}')
    for i in range(max(0,a-1),min(b,len(s))):
        line=s[i]
        if len(line)>3500:line=line[:3500]+' ...[TRUNCATED]'
        o.append(f'{i+1}: {line}')
Path('diagnostics/placement-return-audit.txt').write_text('\n'.join(o)[:120000],encoding='utf-8')

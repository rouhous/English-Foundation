from pathlib import Path
s=Path('index.html').read_text(encoding='utf-8')
lines=s.splitlines()
terms=['عودة','التشخيص','placement','diagnostic','goBack','return','التالي']
out=[]
for term in terms:
    hits=[i for i,line in enumerate(lines) if term.casefold() in line.casefold()]
    out.append(f'\n## {term}: {len(hits)} matching lines\n')
    for i in hits[:24]:
        lo=max(0,i-3); hi=min(len(lines),i+4)
        out.append('\n'.join(f'{j+1}: {lines[j][:440]}' for j in range(lo,hi))[:2400]+'\n')
Path('diagnostics').mkdir(exist_ok=True)
Path('diagnostics/placement-return-audit.txt').write_text('\n'.join(out)[:90000],encoding='utf-8')

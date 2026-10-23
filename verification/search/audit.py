"""Audit indexable sitemap URLs, metadata, schema, local references and crawl reachability."""
import json
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
import xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[2]
class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.h1=0;self.title='';self.in_title=False;self.canonical='';self.description='';self.refs=[];self.links=[];self.schema=None;self.schemas=[];self.noindex=False
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='h1': self.h1+=1
        if tag=='title': self.in_title=True
        if tag=='meta':
            if a.get('name')=='description': self.description=a.get('content','')
            if a.get('name')=='robots': self.noindex='noindex' in a.get('content','')
        if tag=='link' and a.get('rel')=='canonical': self.canonical=a.get('href','')
        if tag=='a': self.links.append(a.get('href',''))
        if tag in ('a','link','img','script'): self.refs.append(a.get('href') or a.get('src') or '')
        if tag=='script' and a.get('type')=='application/ld+json': self.schema=''
    def handle_data(self,data):
        if self.in_title:self.title+=data
        if self.schema is not None:self.schema+=data
    def handle_endtag(self,tag):
        if tag=='title':self.in_title=False
        if tag=='script' and self.schema is not None:self.schemas.append(json.loads(self.schema));self.schema=None

def resolve(base,href):
    u=urlparse(href)
    if u.scheme or not u.path:return None
    p=(ROOT/unquote(u.path).lstrip('/')) if u.path.startswith('/') else base.parent/unquote(u.path)
    if p.is_dir():p=p/'index.html'
    return p.resolve()
urls=[e.text for e in ET.parse(ROOT/'sitemap.xml').getroot().iter() if e.tag.endswith('loc')]
pages={};titles=set();descs=set()
for url in urls:
    path=urlparse(url).path
    file=ROOT/path.lstrip('/')
    if file.is_dir():file=file/'index.html'
    assert file.exists(),url
    page=Page();page.feed(file.read_text());assert page.h1==1,(url,'H1 count',page.h1)
    assert page.title and page.title not in titles,(url,'title');titles.add(page.title)
    assert page.description and page.description not in descs,(url,'description');descs.add(page.description)
    assert page.canonical==url,(url,page.canonical)
    assert not page.noindex,(url,'noindex in sitemap')
    for ref in page.refs:
        p=resolve(file,ref)
        if p:assert p.exists(),(url,ref)
    pages[file.resolve()]=page
seen=set();queue=[(ROOT/'index.html').resolve()]
while queue:
    file=queue.pop()
    if file in seen:continue
    seen.add(file)
    if file not in pages:continue
    for href in pages[file].links:
        p=resolve(file,href)
        if p in pages:queue.append(p)
assert set(pages)<=seen, 'Orphan pages: '+str(set(pages)-seen)
result={'sitemap_urls':len(urls),'unique_titles_and_descriptions':True,'valid_canonicals_and_schema':True,'all_sitemap_pages_reachable_from_home':True,'missing_local_references':0}
(ROOT/'verification/search/static-results.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))

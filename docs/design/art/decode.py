import base64,glob,os
d=os.path.dirname(os.path.abspath(__file__))
for f in glob.glob(os.path.join(d,'*.jpg.b64')):
    open(f[:-4],'wb').write(base64.b64decode(open(f).read())); print('wrote',f[:-4])

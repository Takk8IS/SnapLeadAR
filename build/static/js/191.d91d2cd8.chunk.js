(()=>{"use strict";const e="https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js";var t;!function(e){e.LOAD="LOAD",e.EXEC="EXEC",e.WRITE_FILE="WRITE_FILE",e.READ_FILE="READ_FILE",e.DELETE_FILE="DELETE_FILE",e.RENAME="RENAME",e.CREATE_DIR="CREATE_DIR",e.LIST_DIR="LIST_DIR",e.DELETE_DIR="DELETE_DIR",e.ERROR="ERROR",e.DOWNLOAD="DOWNLOAD",e.PROGRESS="PROGRESS",e.LOG="LOG",e.MOUNT="MOUNT",e.UNMOUNT="UNMOUNT"}(t||(t={}));const r=new Error("unknown message type"),a=new Error("ffmpeg is not loaded, call `await ffmpeg.load()` first"),s=(new Error("called FFmpeg.terminate()"),new Error("failed to import ffmpeg-core.js"));let o;self.onmessage=async E=>{let{data:{id:n,type:c,data:i}}=E;const l=[];let R;try{if(c!==t.LOAD&&!o)throw a;switch(c){case t.LOAD:R=await(async r=>{let{coreURL:a,wasmURL:E,workerURL:n}=r;const c=!o;try{a||(a=e),importScripts(a)}catch{if(a||(a=e.replace("/umd/","/esm/")),self.createFFmpegCore=(await import(a)).default,!self.createFFmpegCore)throw s}const i=a,l=E||a.replace(/.js$/g,".wasm"),R=n||a.replace(/.js$/g,".worker.js");return o=await self.createFFmpegCore({mainScriptUrlOrBlob:`${i}#${btoa(JSON.stringify({wasmURL:l,workerURL:R}))}`}),o.setLogger((e=>self.postMessage({type:t.LOG,data:e}))),o.setProgress((e=>self.postMessage({type:t.PROGRESS,data:e}))),c})(i);break;case t.EXEC:R=(e=>{let{args:t,timeout:r=-1}=e;o.setTimeout(r),o.exec(...t);const a=o.ret;return o.reset(),a})(i);break;case t.WRITE_FILE:R=(e=>{let{path:t,data:r}=e;return o.FS.writeFile(t,r),!0})(i);break;case t.READ_FILE:R=(e=>{let{path:t,encoding:r}=e;return o.FS.readFile(t,{encoding:r})})(i);break;case t.DELETE_FILE:R=(e=>{let{path:t}=e;return o.FS.unlink(t),!0})(i);break;case t.RENAME:R=(e=>{let{oldPath:t,newPath:r}=e;return o.FS.rename(t,r),!0})(i);break;case t.CREATE_DIR:R=(e=>{let{path:t}=e;return o.FS.mkdir(t),!0})(i);break;case t.LIST_DIR:R=(e=>{let{path:t}=e;const r=o.FS.readdir(t),a=[];for(const s of r){const e=o.FS.stat(`${t}/${s}`),r=o.FS.isDir(e.mode);a.push({name:s,isDir:r})}return a})(i);break;case t.DELETE_DIR:R=(e=>{let{path:t}=e;return o.FS.rmdir(t),!0})(i);break;case t.MOUNT:R=(e=>{let{fsType:t,options:r,mountPoint:a}=e;const s=t,E=o.FS.filesystems[s];return!!E&&(o.FS.mount(E,r,a),!0)})(i);break;case t.UNMOUNT:R=(e=>{let{mountPoint:t}=e;return o.FS.unmount(t),!0})(i);break;default:throw r}}catch(p){return void self.postMessage({id:n,type:t.ERROR,data:p.toString()})}R instanceof Uint8Array&&l.push(R.buffer),self.postMessage({id:n,type:c,data:R},l)}})();
//# sourceMappingURL=191.d91d2cd8.chunk.js.map
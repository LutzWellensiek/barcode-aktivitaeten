const MAX_FILE=20*1024*1024;
export async function preparePhoto(file){
 if(!file||file.size>MAX_FILE)throw new Error('Bitte ein Foto bis 20 MB auswählen.');
 if(!/^image\/(jpeg|png|webp|heic|heif|avif|gif)$/i.test(file.type)&&!(!file.type&&/\.(jpe?g|png|webp|hei[cf]|avif)$/i.test(file.name)))throw new Error('Bitte ein Foto als JPG, PNG, WebP oder HEIC auswählen.');
 const url=URL.createObjectURL(file),image=new Image();
 try{await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('Dieses Foto konnte nicht gelesen werden. Bitte als JPG auswählen oder neu aufnehmen.'));image.src=url;});if(!image.naturalWidth||!image.naturalHeight)throw new Error('Das Foto ist leer.');
  function jpeg(edge,quality){const ratio=Math.min(1,edge/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));const context=canvas.getContext('2d');if(!context)throw new Error('Fotos können in diesem Browser nicht vorbereitet werden.');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);return {data:canvas.toDataURL('image/jpeg',quality).split(',')[1],width:canvas.width,height:canvas.height};}
  let edge=1600,full=jpeg(edge,.82);while(full.data.length>700000&&edge>500){edge=Math.round(edge*.8);full=jpeg(edge,.72);}const thumb=jpeg(480,.72);if(full.data.length>700000||thumb.data.length>160000)throw new Error('Das Foto ist noch zu groß. Bitte ein anderes Foto versuchen.');return {full:full.data,thumb:thumb.data,width:full.width,height:full.height};
 }finally{URL.revokeObjectURL(url);image.src='';}
}

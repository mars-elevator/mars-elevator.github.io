const CACHE_NAME="mars-elevator-v23";

self.addEventListener("install",event=>{
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(self.clients.claim());
});

function scoped(path){
  return new URL(path,self.registration.scope).href;
}

self.addEventListener("push",event=>{
  let data={
    title:"MARS ELEVATOR",
    body:"Yeni bildiriminiz var.",
    tag:"mars-elevator",
    url:"./",
    kind:"info"
  };

  try{
    if(event.data){
      data={...data,...event.data.json()};
    }
  }catch(e){
    try{data.body=event.data.text()}catch(_){}
  }

  const options={
    body:data.body||"Yeni bildiriminiz var.",
    icon:scoped("assets/mars_pwa_192.png"),
    badge:scoped("assets/mars_badge.png"),
    tag:data.tag||"mars-elevator",
    renotify:true,
    requireInteraction:data.kind==="pending_approval",
    data:{
      url:data.url||"./",
      kind:data.kind||"info",
      requestId:data.requestId||null
    }
  };

  event.waitUntil((async()=>{
    await self.registration.showNotification(data.title||"MARS ELEVATOR",options);
    try{
      if(self.registration.setAppBadge){
        await self.registration.setAppBadge(1);
      }
    }catch(e){}
  })());
});

self.addEventListener("notificationclick",event=>{
  event.notification.close();

  const requested=(event.notification.data&&event.notification.data.url)||"./";
  const targetUrl=(requested==="/" || requested==="")
    ? self.registration.scope
    : new URL(requested,self.registration.scope).href;

  event.waitUntil((async()=>{
    try{
      if(self.registration.clearAppBadge){
        await self.registration.clearAppBadge();
      }
    }catch(e){}

    const allClients=await clients.matchAll({type:"window",includeUncontrolled:true});
    for(const client of allClients){
      try{
        await client.focus();
        if("navigate" in client) await client.navigate(targetUrl);
        return;
      }catch(e){}
    }
    if(clients.openWindow){
      return clients.openWindow(targetUrl);
    }
  })());
});

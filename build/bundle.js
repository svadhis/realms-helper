var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function c(t){return"function"==typeof t}function i(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function r(t,e){t.appendChild(e)}function l(t){t.parentNode.removeChild(t)}function a(t){return document.createElement(t)}function s(t){return document.createTextNode(t)}function u(){return s(" ")}function f(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function d(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function b(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function p(t,e){t.value=null==e?"":e}let x;function g(t){x=t}const m=[],h=[],y=[],v=[],k=Promise.resolve();let w=!1;function $(t){y.push(t)}const j=new Set;let _=0;function E(){const t=x;do{for(;_<m.length;){const t=m[_];_++,g(t),P(t.$$)}for(g(null),m.length=0,_=0;h.length;)h.pop()();for(let t=0;t<y.length;t+=1){const e=y[t];j.has(e)||(j.add(e),e())}y.length=0}while(m.length);for(;v.length;)v.pop()();w=!1,j.clear(),g(t)}function P(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach($)}}const T=new Set;function z(t,e){-1===t.$$.dirty[0]&&(m.push(t),w||(w=!0,k.then(E)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function A(i,r,a,s,u,f,d,b=[-1]){const p=x;g(i);const m=i.$$={fragment:null,ctx:null,props:f,update:t,not_equal:u,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(r.context||(p?p.$$.context:[])),callbacks:n(),dirty:b,skip_bound:!1,root:r.target||p.$$.root};d&&d(m.root);let h=!1;if(m.ctx=a?a(i,r.props||{},((t,e,...n)=>{const o=n.length?n[0]:e;return m.ctx&&u(m.ctx[t],m.ctx[t]=o)&&(!m.skip_bound&&m.bound[t]&&m.bound[t](o),h&&z(i,t)),e})):[],m.update(),h=!0,o(m.before_update),m.fragment=!!s&&s(m.ctx),r.target){if(r.hydrate){const t=function(t){return Array.from(t.childNodes)}(r.target);m.fragment&&m.fragment.l(t),t.forEach(l)}else m.fragment&&m.fragment.c();r.intro&&((y=i.$$.fragment)&&y.i&&(T.delete(y),y.i(v))),function(t,n,i,r){const{fragment:l,on_mount:a,on_destroy:s,after_update:u}=t.$$;l&&l.m(n,i),r||$((()=>{const n=a.map(e).filter(c);s?s.push(...n):o(n),t.$$.on_mount=[]})),u.forEach($)}(i,r.target,r.anchor,r.customElement),E()}var y,v;g(p)}function L(e){let n,c,i,x,g,m,h,y,v,k,w,$,j,_,E,P,T,z,A,L,B,C,H,N,S,O,R,X,q,Y,D,M,U,F,G,I,J,K,Q,V,W,Z,tt,et,nt,ot,ct,it,rt,lt,at,st,ut,ft,dt,bt,pt,xt,gt,mt,ht,yt,vt,kt,wt,$t,jt,_t,Et,Pt,Tt,zt,At,Lt,Bt,Ct,Ht,Nt,St,Ot,Rt,Xt,qt,Yt,Dt,Mt,Ut,Ft,Gt,It,Jt,Kt,Qt,Vt,Wt,Zt,te,ee,ne,oe,ce,ie,re,le,ae,se,ue,fe,de=(e[3]>0?e[7]:"")+"";return{c(){n=a("main"),c=a("div"),i=a("div"),x=a("div"),g=s(e[8]),m=u(),h=a("div"),y=s("X"),k=u(),w=a("div"),$=u(),j=a("div"),E=u(),P=a("div"),T=a("div"),z=s(e[10]),A=u(),L=a("div"),B=s("X"),H=u(),N=a("div"),S=u(),O=a("div"),X=u(),q=a("div"),Y=a("div"),D=a("div"),M=a("div"),U=a("div"),F=s(e[1]),G=u(),I=a("div"),J=u(),K=a("div"),Q=u(),V=a("div"),W=a("div"),Z=a("div"),tt=s(e[2]),et=u(),nt=a("div"),ot=u(),ct=a("div"),it=u(),rt=a("div"),lt=a("div"),lt.textContent="⚙️",at=u(),st=a("div"),st.textContent="END TURN",ut=u(),ft=a("div"),dt=s(de),gt=u(),mt=a("div"),ht=a("div"),yt=a("div"),vt=s(e[9]),kt=u(),wt=a("div"),$t=s("X"),_t=u(),Et=a("div"),Pt=u(),Tt=a("div"),At=u(),Lt=a("div"),Bt=a("div"),Ct=s(e[11]),Ht=u(),Nt=a("div"),St=s("X"),Rt=u(),Xt=a("div"),qt=u(),Yt=a("div"),Mt=u(),Ut=a("div"),Ft=a("div"),Ft.textContent="X",Gt=u(),It=a("div"),Jt=a("div"),Kt=s("2 PLAYERS"),Vt=u(),Wt=a("div"),Zt=s("3 PLAYERS"),ee=u(),ne=a("div"),oe=s("4 PLAYERS"),ie=u(),re=a("div"),le=s("CHRONO :\n\t\t\t"),ae=a("input"),d(x,"id","count1"),d(x,"class","count text-5xl font-black p-3 z-10 flex justify-center items-center"),d(h,"class",v=(e[8]<=0?"flex":"hidden")+" justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]"),d(w,"class","absolute top-0 bottom-1/2 left-0 right-0"),d(j,"class","absolute top-1/2 bottom-0 left-0 right-0"),d(i,"class",_=(1==e[0]||3==e[0]?"rotate-180":"")+" "+(e[4]<=2?"w-full":"w-1/2")+" player bg-blue-800 text-white relative flex justify-center items-center"),d(T,"id","count3"),d(T,"class","count text-5xl font-black p-3 z-10 flex justify-center items-center"),d(L,"class",C=(e[10]<=0?"flex":"hidden")+" justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]"),d(N,"class","absolute top-0 bottom-1/2 left-0 right-0"),d(O,"class","absolute top-1/2 bottom-0 left-0 right-0"),d(P,"class",R=(1==e[0]||3==e[0]?"rotate-180":"")+" "+(e[4]>=3?"flex":"hidden")+" player bg-orange-800 text-white w-1/2 relative justify-center items-center"),d(c,"class","flex-1 flex"),d(U,"class","count text-5xl font-black p-3 my-10 z-10"),d(I,"class","absolute top-0 bottom-1/2 left-0 right-0"),d(K,"class","absolute top-1/2 bottom-0 left-0 right-0"),d(M,"class","counter relative flex justify-center items-center"),d(D,"class","dmg-counter flex justify-center items-center w-1/2 h-56 p-2"),d(Z,"class","count text-5xl font-black p-3 w-full z-10"),d(nt,"class","absolute top-0 bottom-1/2 left-0 right-0"),d(ct,"class","absolute top-1/2 bottom-0 left-0 right-0"),d(W,"class","counter relative flex justify-center items-center"),d(V,"class","money-counter flex justify-center w-1/2 p-2 h-56 bg-yellow-300"),d(Y,"class","flex"),d(lt,"class","config w-1/5 text-xl p-3"),d(st,"class","end-button flex justify-center items-center py-4"),d(ft,"class",bt="timer w-1/5 text-xl text-right p-3 "+(e[7]<0&&"text-red-300")),d(rt,"class",pt="flex justify-between items-center bg-"+e[6]+"-800 text-3xl font-black px-4 text-white"),d(q,"class",xt="bg-red-500 border-b border-t border-black flex-col "+(1==e[0]||3==e[0]?"rotate-180":"")),d(yt,"id","count2"),d(yt,"class","count text-5xl font-black p-3 z-10 flex justify-center items-center"),d(wt,"class",jt=(e[9]<=0?"flex":"hidden")+" justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]"),d(Et,"class","absolute top-0 bottom-1/2 left-0 right-0"),d(Tt,"class","absolute top-1/2 bottom-0 left-0 right-0"),d(ht,"class",zt=(1==e[0]||3==e[0]?"rotate-180":"")+" "+(e[4]>=2?"flex":"hidden")+" "+(e[4]<=3?"w-full":"w-1/2")+" player bg-pink-800 text-white relative flex justify-center items-center"),d(Bt,"id","count4"),d(Bt,"class","count text-5xl font-black p-3 z-10 flex justify-center items-center"),d(Nt,"class",Ot=(e[11]<=0?"flex":"hidden")+" justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]"),d(Xt,"class","absolute top-0 bottom-1/2 left-0 right-0"),d(Yt,"class","absolute top-1/2 bottom-0 left-0 right-0"),d(Lt,"class",Dt=(1==e[0]||3==e[0]?"rotate-180":"")+" "+(e[4]>=4?"flex":"hidden")+" player bg-green-800 text-white w-1/2 relative justify-center items-center"),d(mt,"class","flex-1 flex"),d(Ft,"class","absolute top-3 right-3 p-4 text-3xl"),d(Jt,"class",Qt="players-2 "+(2==e[4]?"bg-gray-800":"bg-black")+" p-3 border rounded text-center"),d(Wt,"class",te="players-3 "+(3==e[4]?"bg-gray-800":"bg-black")+" p-3 border rounded text-center"),d(ne,"class",ce="players-4 "+(4==e[4]?"bg-gray-800":"bg-black")+" p-3 border rounded text-center"),d(It,"class","player-number flex flex-col space-y-2"),d(ae,"class","bg-black w-32"),d(re,"class","timer-option my-6"),d(Ut,"class",se="option-board "+(1==e[0]||3==e[0]?"rotate-180":"")+" "+(e[5]?"block":"hidden")+" z-50 text-white absolute top-0 bottom-0 left-0 right-0 bg-black p-5 flex flex-col justify-center"),d(n,"class","h-screen flex flex-col border-blue-800 border-pink-800 border-orange-800 border-green-800")},m(t,o){!function(t,e,n){t.insertBefore(e,n||null)}(t,n,o),r(n,c),r(c,i),r(i,x),r(x,g),r(i,m),r(i,h),r(h,y),r(i,k),r(i,w),r(i,$),r(i,j),r(c,E),r(c,P),r(P,T),r(T,z),r(P,A),r(P,L),r(L,B),r(P,H),r(P,N),r(P,S),r(P,O),r(n,X),r(n,q),r(q,Y),r(Y,D),r(D,M),r(M,U),r(U,F),r(M,G),r(M,I),r(M,J),r(M,K),r(Y,Q),r(Y,V),r(V,W),r(W,Z),r(Z,tt),r(W,et),r(W,nt),r(W,ot),r(W,ct),r(q,it),r(q,rt),r(rt,lt),r(rt,at),r(rt,st),r(rt,ut),r(rt,ft),r(ft,dt),r(n,gt),r(n,mt),r(mt,ht),r(ht,yt),r(yt,vt),r(ht,kt),r(ht,wt),r(wt,$t),r(ht,_t),r(ht,Et),r(ht,Pt),r(ht,Tt),r(mt,At),r(mt,Lt),r(Lt,Bt),r(Bt,Ct),r(Lt,Ht),r(Lt,Nt),r(Nt,St),r(Lt,Rt),r(Lt,Xt),r(Lt,qt),r(Lt,Yt),r(n,Mt),r(n,Ut),r(Ut,Ft),r(Ut,Gt),r(Ut,It),r(It,Jt),r(Jt,Kt),r(It,Vt),r(It,Wt),r(Wt,Zt),r(It,ee),r(It,ne),r(ne,oe),r(Ut,ie),r(Ut,re),r(re,le),r(re,ae),p(ae,e[3]),ue||(fe=[f(w,"click",e[14]),f(j,"click",e[15]),f(N,"click",e[18]),f(O,"click",e[19]),f(I,"click",e[22]),f(K,"click",e[23]),f(nt,"click",e[24]),f(ct,"click",e[25]),f(lt,"click",e[13]),f(st,"click",e[26]),f(Et,"click",e[16]),f(Tt,"click",e[17]),f(Xt,"click",e[20]),f(Yt,"click",e[21]),f(Ft,"click",e[13]),f(Jt,"click",e[28]),f(Wt,"click",e[29]),f(ne,"click",e[30]),f(ae,"input",e[31])],ue=!0)},p(t,e){256&e[0]&&b(g,t[8]),256&e[0]&&v!==(v=(t[8]<=0?"flex":"hidden")+" justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]")&&d(h,"class",v),17&e[0]&&_!==(_=(1==t[0]||3==t[0]?"rotate-180":"")+" "+(t[4]<=2?"w-full":"w-1/2")+" player bg-blue-800 text-white relative flex justify-center items-center")&&d(i,"class",_),1024&e[0]&&b(z,t[10]),1024&e[0]&&C!==(C=(t[10]<=0?"flex":"hidden")+" justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]")&&d(L,"class",C),17&e[0]&&R!==(R=(1==t[0]||3==t[0]?"rotate-180":"")+" "+(t[4]>=3?"flex":"hidden")+" player bg-orange-800 text-white w-1/2 relative justify-center items-center")&&d(P,"class",R),2&e[0]&&b(F,t[1]),4&e[0]&&b(tt,t[2]),136&e[0]&&de!==(de=(t[3]>0?t[7]:"")+"")&&b(dt,de),128&e[0]&&bt!==(bt="timer w-1/5 text-xl text-right p-3 "+(t[7]<0&&"text-red-300"))&&d(ft,"class",bt),64&e[0]&&pt!==(pt="flex justify-between items-center bg-"+t[6]+"-800 text-3xl font-black px-4 text-white")&&d(rt,"class",pt),1&e[0]&&xt!==(xt="bg-red-500 border-b border-t border-black flex-col "+(1==t[0]||3==t[0]?"rotate-180":""))&&d(q,"class",xt),512&e[0]&&b(vt,t[9]),512&e[0]&&jt!==(jt=(t[9]<=0?"flex":"hidden")+" justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]")&&d(wt,"class",jt),17&e[0]&&zt!==(zt=(1==t[0]||3==t[0]?"rotate-180":"")+" "+(t[4]>=2?"flex":"hidden")+" "+(t[4]<=3?"w-full":"w-1/2")+" player bg-pink-800 text-white relative flex justify-center items-center")&&d(ht,"class",zt),2048&e[0]&&b(Ct,t[11]),2048&e[0]&&Ot!==(Ot=(t[11]<=0?"flex":"hidden")+" justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]")&&d(Nt,"class",Ot),17&e[0]&&Dt!==(Dt=(1==t[0]||3==t[0]?"rotate-180":"")+" "+(t[4]>=4?"flex":"hidden")+" player bg-green-800 text-white w-1/2 relative justify-center items-center")&&d(Lt,"class",Dt),16&e[0]&&Qt!==(Qt="players-2 "+(2==t[4]?"bg-gray-800":"bg-black")+" p-3 border rounded text-center")&&d(Jt,"class",Qt),16&e[0]&&te!==(te="players-3 "+(3==t[4]?"bg-gray-800":"bg-black")+" p-3 border rounded text-center")&&d(Wt,"class",te),16&e[0]&&ce!==(ce="players-4 "+(4==t[4]?"bg-gray-800":"bg-black")+" p-3 border rounded text-center")&&d(ne,"class",ce),8&e[0]&&ae.value!==t[3]&&p(ae,t[3]),33&e[0]&&se!==(se="option-board "+(1==t[0]||3==t[0]?"rotate-180":"")+" "+(t[5]?"block":"hidden")+" z-50 text-white absolute top-0 bottom-0 left-0 right-0 bg-black p-5 flex flex-col justify-center")&&d(Ut,"class",se)},i:t,o:t,d(t){t&&l(n),ue=!1,o(fe)}}}function B(t,e,n){let{activePlayer:o,initialHealth:c,damage:i,money:r,maxTime:l,players:a,optionBoard:s}=e,u=h(),f=l,d=c,b=c,p=c,x=c;function g(t){n(4,a=t)}function m(t){let e=t==a?1:t+1;switch(t){case 4:if(d<=0)return m(e);break;case 1:if(b<=0)return m(e);break;case 2:if(p<=0)return m(e);break;case 3:if(x<=0)return m(e)}return e}function h(){return 1==o?"blue":2==o?"pink":3==o?"orange":"green"}!function t(){setTimeout((()=>{l>0&&n(7,f--,f),t()}),1e3)}(),document.querySelectorAll(".count"),document.addEventListener("long-press",(function(t){switch(t.target.id){case"count1":n(8,d-=i),n(1,i=0);break;case"count2":n(9,b-=i),n(1,i=0);break;case"count3":n(10,p-=i),n(1,i=0);break;case"count4":n(11,x-=i),n(1,i=0)}}));return t.$$set=t=>{"activePlayer"in t&&n(0,o=t.activePlayer),"initialHealth"in t&&n(27,c=t.initialHealth),"damage"in t&&n(1,i=t.damage),"money"in t&&n(2,r=t.money),"maxTime"in t&&n(3,l=t.maxTime),"players"in t&&n(4,a=t.players),"optionBoard"in t&&n(5,s=t.optionBoard)},[o,i,r,l,a,s,u,f,d,b,p,x,g,function(){n(5,s=!s)},function(){n(8,d+=1)},function(){n(8,d-=1)},function(){n(9,b+=1)},function(){n(9,b-=1)},function(){n(10,p+=1)},function(){n(10,p-=1)},function(){n(11,x+=1)},function(){n(11,x-=1)},function(){n(1,i+=1)},function(){n(1,i-=1)},function(){n(2,r+=1)},function(){n(2,r-=1)},function(){n(2,r=0),n(1,i=0),n(0,o=m(o)),n(6,u=h()),n(7,f=l)},c,()=>g(2),()=>g(3),()=>g(4),function(){l=this.value,n(3,l)}]}const C=new class extends class{$destroy(){!function(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}{constructor(t){super(),A(this,t,B,L,i,{activePlayer:0,initialHealth:27,damage:1,money:2,maxTime:3,players:4,optionBoard:5},null,[-1,-1])}}({target:document.body,props:{activePlayer:1,damage:0,money:0,players:3,initialHealth:50,maxTime:0,optionBoard:!1}});return navigator.wakeLock.request("screen"),window.addEventListener("contextmenu",(function(t){t.preventDefault()}),!1),C}();
//# sourceMappingURL=bundle.js.map

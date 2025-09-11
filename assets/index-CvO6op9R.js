import{j as w}from"./globe-BDvu76SH.js";import{L as M,a as L,A as x,D as E,B as A,P as T,F as B,b as k,G as D,c as I,C as $,d as P,V as F}from"./three-vPXGKxFS.js";import"./d3-BzNBBN38.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))e(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&e(c)}).observe(document,{childList:!0,subtree:!0});function a(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function e(i){if(i.ep)return;i.ep=!0;const n=a(i);fetch(i.href,n)}})();class U{constructor(){this.dataCache=new Map,this.dataSources={peeringDB:"https://www.peeringdb.com/api/",hurricaneElectric:"https://bgp.he.net/api/",submarineCableMap:"https://www.submarinecablemap.com/api/v3/",cloudflareRadar:"https://radar.cloudflare.com/api/"},this.fallbackData=this.initializeFallbackData()}initializeFallbackData(){return{cables:this.generateSubmarineCables(),datacenters:this.generateDataCenters(),bgpRoutes:this.generateBGPRoutes()}}generateSubmarineCables(){const t=[{name:"MAREA",owner:"Microsoft, Facebook, Telxius",landing_point_1:{latitude:36.8,longitude:-75.9,location:"Virginia Beach, USA"},landing_point_2:{latitude:43.4,longitude:-8.2,location:"Bilbao, Spain"},capacity_tbps:200,status:"active",year:2017,data_accuracy:"live"},{name:"Grace Hopper",owner:"Google",landing_point_1:{latitude:40.5,longitude:-74.2,location:"New York, USA"},landing_point_2:{latitude:50.6,longitude:-1.3,location:"Bude, UK"},capacity_tbps:250,status:"active",year:2022,data_accuracy:"live"},{name:"2Africa",owner:"Meta, MTN, Orange, Vodafone",landing_point_1:{latitude:51.5,longitude:-.1,location:"London, UK"},landing_point_2:{latitude:-33.9,longitude:18.4,location:"Cape Town, South Africa"},capacity_tbps:180,status:"active",year:2023,data_accuracy:"live"},{name:"Pacific Light Cable Network",owner:"Google, Facebook",landing_point_1:{latitude:22.3,longitude:114.2,location:"Hong Kong"},landing_point_2:{latitude:34,longitude:-118.2,location:"Los Angeles, USA"},capacity_tbps:144,status:"active",year:2018,data_accuracy:"live"},{name:"JUPITER",owner:"Amazon, NTT, Softbank",landing_point_1:{latitude:35.7,longitude:139.7,location:"Tokyo, Japan"},landing_point_2:{latitude:34,longitude:-118.2,location:"Los Angeles, USA"},capacity_tbps:60,status:"active",year:2020,data_accuracy:"live"},{name:"Dunant",owner:"Google",landing_point_1:{latitude:36.8,longitude:-75.9,location:"Virginia Beach, USA"},landing_point_2:{latitude:44.4,longitude:-1.2,location:"Saint-Hilaire-de-Riez, France"},capacity_tbps:250,status:"active",year:2020,data_accuracy:"live"},{name:"EllaLink",owner:"EllaLink Group",landing_point_1:{latitude:-23,longitude:-43.2,location:"Fortaleza, Brazil"},landing_point_2:{latitude:38.7,longitude:-9.1,location:"Sines, Portugal"},capacity_tbps:100,status:"active",year:2021,data_accuracy:"estimated"},{name:"SEA-ME-WE 5",owner:"Consortium",landing_point_1:{latitude:1.3,longitude:103.8,location:"Singapore"},landing_point_2:{latitude:43.7,longitude:7.3,location:"Marseille, France"},capacity_tbps:24,status:"active",year:2016,data_accuracy:"live"},{name:"FASTER",owner:"Google, KDDI, SingTel",landing_point_1:{latitude:35.5,longitude:139.8,location:"Chiba, Japan"},landing_point_2:{latitude:45.6,longitude:-122.6,location:"Oregon, USA"},capacity_tbps:60,status:"active",year:2016,data_accuracy:"live"},{name:"Australia-Singapore Cable",owner:"Vocus, Superloop",landing_point_1:{latitude:-31.9,longitude:115.9,location:"Perth, Australia"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:40,status:"active",year:2018,data_accuracy:"estimated"},{name:"TAT-14",owner:"AT&T, BT, Deutsche Telekom, France Telecom, Sprint",landing_point_1:{latitude:40.5,longitude:-74,location:"Manasquan, USA"},landing_point_2:{latitude:52.4,longitude:1.7,location:"Blaricum, Netherlands"},capacity_tbps:40,status:"active",year:2001,data_accuracy:"live"},{name:"FLAG Atlantic-1",owner:"Reliance Globalcom",landing_point_1:{latitude:40.5,longitude:-74,location:"New York, USA"},landing_point_2:{latitude:51.5,longitude:-.1,location:"London, UK"},capacity_tbps:30,status:"active",year:2e3,data_accuracy:"live"},{name:"Amitié",owner:"Meta, Microsoft, Orange, Vodafone",landing_point_1:{latitude:41.9,longitude:-70,location:"Lynn, USA"},landing_point_2:{latitude:44.4,longitude:-1.2,location:"Le Porge, France"},capacity_tbps:400,status:"active",year:2023,data_accuracy:"live"},{name:"Equiano",owner:"Google",landing_point_1:{latitude:38.7,longitude:-9.1,location:"Lisbon, Portugal"},landing_point_2:{latitude:-33.9,longitude:18.4,location:"Cape Town, South Africa"},capacity_tbps:144,status:"active",year:2022,data_accuracy:"live"},{name:"PEACE Cable",owner:"PCCW Global, Hengtong Group",landing_point_1:{latitude:24.5,longitude:54.4,location:"Gwadar, Pakistan"},landing_point_2:{latitude:43.7,longitude:7.3,location:"Marseille, France"},capacity_tbps:180,status:"active",year:2022,data_accuracy:"live"},{name:"Southern Cross NEXT",owner:"Southern Cross Cables",landing_point_1:{latitude:-33.9,longitude:151.2,location:"Sydney, Australia"},landing_point_2:{latitude:34,longitude:-118.2,location:"Los Angeles, USA"},capacity_tbps:72,status:"active",year:2022,data_accuracy:"live"},{name:"INDIGO-West",owner:"Telstra, Singtel, SubPartners",landing_point_1:{latitude:-31.9,longitude:115.9,location:"Perth, Australia"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:36,status:"active",year:2019,data_accuracy:"live"},{name:"Asia-America Gateway (AAG)",owner:"AT&T, NTT, PLDT, Singtel, others",landing_point_1:{latitude:21.3,longitude:-157.9,location:"Hawaii, USA"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:20,status:"active",year:2009,data_accuracy:"live"},{name:"Echo",owner:"Google, Meta",landing_point_1:{latitude:33.6,longitude:-117.9,location:"Eureka, USA"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:240,status:"planned",year:2024,data_accuracy:"estimated"},{name:"Bifrost",owner:"Meta, Keppel, Telin",landing_point_1:{latitude:37.8,longitude:-122.4,location:"San Francisco, USA"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:190,status:"planned",year:2024,data_accuracy:"estimated"},{name:"Atlantic Crossing-1 (AC-1)",owner:"Lumen Technologies",landing_point_1:{latitude:40.6,longitude:-74,location:"Brookhaven, USA"},landing_point_2:{latitude:52.9,longitude:-3,location:"Whitesands Bay, UK"},capacity_tbps:40,status:"active",year:1998,data_accuracy:"live"},{name:"Apollo",owner:"Vodafone, Orange, Meta",landing_point_1:{latitude:50.6,longitude:-1.3,location:"Bude, UK"},landing_point_2:{latitude:40.6,longitude:-74,location:"Brookhaven, USA"},capacity_tbps:200,status:"active",year:2020,data_accuracy:"live"},{name:"MAREA",owner:"Microsoft, Meta, Telxius",landing_point_1:{latitude:36.8,longitude:-75.9,location:"Virginia Beach, USA"},landing_point_2:{latitude:43.4,longitude:-8.2,location:"Bilbao, Spain"},capacity_tbps:200,status:"active",year:2017,data_accuracy:"live"},{name:"Dunant",owner:"Google",landing_point_1:{latitude:36.8,longitude:-75.9,location:"Virginia Beach, USA"},landing_point_2:{latitude:44.4,longitude:-1.2,location:"Saint-Hilaire-de-Riez, France"},capacity_tbps:250,status:"active",year:2020,data_accuracy:"live"},{name:"Havfrue/AEC-2",owner:"Aqua Comms, Meta, Google, Bulk Infrastructure",landing_point_1:{latitude:39.3,longitude:-74.5,location:"Wall Township, USA"},landing_point_2:{latitude:55.4,longitude:8.4,location:"Blaabjerg, Denmark"},capacity_tbps:108,status:"active",year:2019,data_accuracy:"live"},{name:"EllaLink",owner:"EllaLink Group",landing_point_1:{latitude:-23,longitude:-43.2,location:"Praia Grande, Brazil"},landing_point_2:{latitude:38.7,longitude:-9.4,location:"Sines, Portugal"},capacity_tbps:72,status:"active",year:2021,data_accuracy:"live"},{name:"Curie",owner:"Google",landing_point_1:{latitude:33,longitude:-117.3,location:"Hermosa Beach, USA"},landing_point_2:{latitude:-33,longitude:-71.6,location:"Valparaiso, Chile"},capacity_tbps:72,status:"active",year:2019,data_accuracy:"live"},{name:"Junior",owner:"Google, ALDA Marine, Sparkle",landing_point_1:{latitude:-22.9,longitude:-43.2,location:"Rio de Janeiro, Brazil"},landing_point_2:{latitude:-34.9,longitude:-56.2,location:"Punta del Este, Uruguay"},capacity_tbps:60,status:"active",year:2018,data_accuracy:"live"},{name:"Tannat",owner:"Google, Antel",landing_point_1:{latitude:-34.5,longitude:-54.9,location:"Maldonado, Uruguay"},landing_point_2:{latitude:-23.5,longitude:-46.3,location:"Santos, Brazil"},capacity_tbps:90,status:"active",year:2018,data_accuracy:"live"},{name:"Monet",owner:"Google, Antel, Angola Cables, Algar Telecom",landing_point_1:{latitude:-23.9,longitude:-46.3,location:"Praia Grande, Brazil"},landing_point_2:{latitude:26.5,longitude:-78.7,location:"Boca Raton, USA"},capacity_tbps:64,status:"active",year:2017,data_accuracy:"live"},{name:"SAEx1",owner:"SAEx International",landing_point_1:{latitude:-33.9,longitude:18.4,location:"Cape Town, South Africa"},landing_point_2:{latitude:-23.5,longitude:-46.6,location:"Santos, Brazil"},capacity_tbps:32,status:"active",year:2018,data_accuracy:"estimated"},{name:"BRUSA",owner:"Telxius",landing_point_1:{latitude:-22.9,longitude:-43.2,location:"Rio de Janeiro, Brazil"},landing_point_2:{latitude:36.8,longitude:-75.9,location:"Virginia Beach, USA"},capacity_tbps:138,status:"active",year:2018,data_accuracy:"live"},{name:"WASACE",owner:"Angola Cables",landing_point_1:{latitude:-8.8,longitude:13.2,location:"Luanda, Angola"},landing_point_2:{latitude:-33.9,longitude:18.4,location:"Cape Town, South Africa"},capacity_tbps:40,status:"active",year:2018,data_accuracy:"estimated"},{name:"SACS",owner:"Angola Cables",landing_point_1:{latitude:-8.8,longitude:13.2,location:"Luanda, Angola"},landing_point_2:{latitude:-3.7,longitude:-38.5,location:"Fortaleza, Brazil"},capacity_tbps:40,status:"active",year:2018,data_accuracy:"estimated"},{name:"Malbec",owner:"GlobeNet, Meta",landing_point_1:{latitude:-34.6,longitude:-58.4,location:"Las Toninas, Argentina"},landing_point_2:{latitude:-23,longitude:-43.2,location:"Praia Grande, Brazil"},capacity_tbps:48,status:"active",year:2022,data_accuracy:"live"},{name:"Firmina",owner:"Google",landing_point_1:{latitude:33.8,longitude:-118.4,location:"Dockweiler Beach, USA"},landing_point_2:{latitude:-34.6,longitude:-58.4,location:"Las Toninas, Argentina"},capacity_tbps:240,status:"planned",year:2024,data_accuracy:"estimated"},{name:"JUPITER",owner:"NTT, Google, PLDT, PCCW, Softbank, Meta",landing_point_1:{latitude:35.3,longitude:139.8,location:"Maruyama, Japan"},landing_point_2:{latitude:34,longitude:-118.5,location:"Hermosa Beach, USA"},capacity_tbps:60,status:"active",year:2020,data_accuracy:"live"},{name:"FASTER",owner:"Google, KDDI, Singtel, China Mobile, China Telecom",landing_point_1:{latitude:36.6,longitude:138.2,location:"Shima, Japan"},landing_point_2:{latitude:45.6,longitude:-123.9,location:"Bandon, USA"},capacity_tbps:60,status:"active",year:2016,data_accuracy:"live"},{name:"PLCN",owner:"Google, Meta",landing_point_1:{latitude:34,longitude:-118.5,location:"El Segundo, USA"},landing_point_2:{latitude:25.1,longitude:121.5,location:"Toucheng, Taiwan"},capacity_tbps:144,status:"active",year:2019,data_accuracy:"live"},{name:"New Cross Pacific (NCP)",owner:"Microsoft, China Mobile, China Telecom, China Unicom, KT Corporation",landing_point_1:{latitude:45.6,longitude:-123.9,location:"Pacific City, USA"},landing_point_2:{latitude:31.2,longitude:121.5,location:"Shanghai, China"},capacity_tbps:80,status:"active",year:2018,data_accuracy:"live"},{name:"SEA-ME-WE 5",owner:"Consortium of 20+ carriers",landing_point_1:{latitude:1.3,longitude:103.8,location:"Singapore"},landing_point_2:{latitude:43.3,longitude:5.4,location:"Marseille, France"},capacity_tbps:24,status:"active",year:2016,data_accuracy:"live"},{name:"SEA-ME-WE 4",owner:"Consortium of 16 carriers",landing_point_1:{latitude:1.3,longitude:103.8,location:"Singapore"},landing_point_2:{latitude:43.3,longitude:5.4,location:"Marseille, France"},capacity_tbps:40,status:"active",year:2005,data_accuracy:"live"},{name:"Asia Africa Europe-1 (AAE-1)",owner:"Consortium of 19 carriers",landing_point_1:{latitude:22.3,longitude:114.2,location:"Hong Kong"},landing_point_2:{latitude:43.3,longitude:5.4,location:"Marseille, France"},capacity_tbps:40,status:"active",year:2017,data_accuracy:"live"},{name:"APG",owner:"Consortium including China Telecom, NTT, PLDT",landing_point_1:{latitude:35.4,longitude:139.6,location:"Chikura, Japan"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:54,status:"active",year:2016,data_accuracy:"live"},{name:"SJC",owner:"Consortium including Google, KDDI, Singtel",landing_point_1:{latitude:35.1,longitude:139.8,location:"Chikura, Japan"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:28,status:"active",year:2013,data_accuracy:"live"},{name:"Unity",owner:"Google, KDDI, Singtel, Bharti, Global Transit",landing_point_1:{latitude:35.1,longitude:139.8,location:"Chikura, Japan"},landing_point_2:{latitude:34,longitude:-118.5,location:"Redondo Beach, USA"},capacity_tbps:10,status:"active",year:2010,data_accuracy:"live"},{name:"TGN-Pacific",owner:"Tata Communications",landing_point_1:{latitude:35.4,longitude:139.8,location:"Emi, Japan"},landing_point_2:{latitude:45.6,longitude:-123.9,location:"Nedonna Beach, USA"},capacity_tbps:5.12,status:"active",year:2002,data_accuracy:"estimated"},{name:"FALCON",owner:"Global Cloud Xchange",landing_point_1:{latitude:19.1,longitude:72.9,location:"Mumbai, India"},landing_point_2:{latitude:30,longitude:31.2,location:"Cairo, Egypt"},capacity_tbps:5.12,status:"active",year:2006,data_accuracy:"estimated"},{name:"IMEWE",owner:"Consortium of 9 carriers",landing_point_1:{latitude:19.1,longitude:72.9,location:"Mumbai, India"},landing_point_2:{latitude:43.3,longitude:5.4,location:"Marseille, France"},capacity_tbps:5.12,status:"active",year:2010,data_accuracy:"estimated"},{name:"Bay of Bengal Gateway (BBG)",owner:"Vodafone, Reliance, Dialog, Etisalat",landing_point_1:{latitude:13.1,longitude:80.3,location:"Chennai, India"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:10,status:"active",year:2015,data_accuracy:"live"},{name:"i2i",owner:"Bharti Airtel, Singtel",landing_point_1:{latitude:13.1,longitude:80.3,location:"Chennai, India"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:8.4,status:"active",year:2002,data_accuracy:"estimated"},{name:"MENA",owner:"Orascom Telecom, Telecom Italia",landing_point_1:{latitude:31.2,longitude:29.9,location:"Alexandria, Egypt"},landing_point_2:{latitude:45.4,longitude:12.3,location:"Venice, Italy"},capacity_tbps:5.12,status:"active",year:2011,data_accuracy:"estimated"},{name:"RAMAN",owner:"Telekom Malaysia, Symphony",landing_point_1:{latitude:2.2,longitude:102.2,location:"Melaka, Malaysia"},landing_point_2:{latitude:19.1,longitude:72.9,location:"Mumbai, India"},capacity_tbps:100,status:"planned",year:2024,data_accuracy:"estimated"},{name:"PEACE",owner:"PEACE Cable International",landing_point_1:{latitude:24.5,longitude:67,location:"Karachi, Pakistan"},landing_point_2:{latitude:43.3,longitude:5.4,location:"Marseille, France"},capacity_tbps:96,status:"active",year:2022,data_accuracy:"live"},{name:"Australia-Singapore Cable (ASC)",owner:"Vocus, Superloop, Google, AARNet",landing_point_1:{latitude:-31.9,longitude:115.8,location:"Perth, Australia"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:40,status:"active",year:2018,data_accuracy:"live"},{name:"INDIGO-Central",owner:"Consortium including Google, Telstra, Singtel",landing_point_1:{latitude:-31.9,longitude:115.8,location:"Perth, Australia"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:36,status:"active",year:2019,data_accuracy:"live"},{name:"SeaMeWe-3",owner:"Consortium of 90+ carriers",landing_point_1:{latitude:52.4,longitude:4.3,location:"Norden, Germany"},landing_point_2:{latitude:35.7,longitude:139.7,location:"Tokyo, Japan"},capacity_tbps:5,status:"active",year:1999,data_accuracy:"historical"},{name:"Hawaiki",owner:"BW Digital",landing_point_1:{latitude:-36.8,longitude:174.7,location:"Auckland, New Zealand"},landing_point_2:{latitude:45.2,longitude:-123.9,location:"Pacific City, USA"},capacity_tbps:43.8,status:"active",year:2018,data_accuracy:"live"},{name:"Southern Cross NEXT",owner:"Southern Cross Cables",landing_point_1:{latitude:-33.9,longitude:151.2,location:"Sydney, Australia"},landing_point_2:{latitude:34,longitude:-118.5,location:"Hermosa Beach, USA"},capacity_tbps:72,status:"active",year:2022,data_accuracy:"live"}],a=[],e=[{lat:51.5,lng:-.1,name:"London, UK"},{lat:40.7,lng:-74,name:"New York, USA"},{lat:35.7,lng:139.7,name:"Tokyo, Japan"},{lat:1.3,lng:103.8,name:"Singapore"},{lat:-33.9,lng:18.4,name:"Cape Town, South Africa"},{lat:-23.5,lng:-46.6,name:"São Paulo, Brazil"},{lat:25,lng:55.3,name:"Dubai, UAE"},{lat:-33.9,lng:151.2,name:"Sydney, Australia"},{lat:19.4,lng:-99.1,name:"Mexico City, Mexico"},{lat:13.1,lng:80.3,name:"Chennai, India"},{lat:22.3,lng:114.2,name:"Hong Kong, China"},{lat:34,lng:-118.2,name:"Los Angeles, USA"},{lat:37.8,lng:-122.4,name:"San Francisco, USA"},{lat:52.5,lng:13.4,name:"Berlin, Germany"},{lat:48.9,lng:2.3,name:"Paris, France"},{lat:41.9,lng:12.5,name:"Rome, Italy"},{lat:55.8,lng:37.6,name:"Moscow, Russia"},{lat:39.9,lng:116.4,name:"Beijing, China"},{lat:31.2,lng:121.5,name:"Shanghai, China"},{lat:19.1,lng:72.9,name:"Mumbai, India"},{lat:-6.2,lng:106.8,name:"Jakarta, Indonesia"},{lat:14.6,lng:121,name:"Manila, Philippines"},{lat:13.8,lng:100.5,name:"Bangkok, Thailand"},{lat:3.1,lng:101.7,name:"Kuala Lumpur, Malaysia"},{lat:37.6,lng:127,name:"Seoul, South Korea"},{lat:43.7,lng:-79.4,name:"Toronto, Canada"},{lat:45.5,lng:-73.6,name:"Montreal, Canada"},{lat:49.3,lng:-123.1,name:"Vancouver, Canada"},{lat:-34.6,lng:-58.4,name:"Buenos Aires, Argentina"},{lat:30,lng:31.2,name:"Cairo, Egypt"},{lat:-1.3,lng:36.8,name:"Nairobi, Kenya"},{lat:6.5,lng:3.4,name:"Lagos, Nigeria"},{lat:59.3,lng:18.1,name:"Stockholm, Sweden"},{lat:55.7,lng:12.6,name:"Copenhagen, Denmark"},{lat:52.4,lng:4.9,name:"Amsterdam, Netherlands"},{lat:50.8,lng:4.4,name:"Brussels, Belgium"},{lat:40.4,lng:-3.7,name:"Madrid, Spain"},{lat:38.7,lng:-9.1,name:"Lisbon, Portugal"},{lat:53.3,lng:-6.3,name:"Dublin, Ireland"},{lat:36.8,lng:-75.9,name:"Virginia Beach, USA"},{lat:44.4,lng:-1.2,name:"Saint-Hilaire-de-Riez, France"},{lat:50.6,lng:-1.3,name:"Bude, UK"},{lat:43.4,lng:-8.2,name:"Bilbao, Spain"},{lat:38,lng:-122.8,name:"Point Arena, USA"},{lat:41.8,lng:-87.6,name:"Chicago, USA"},{lat:39,lng:-77.5,name:"Ashburn, USA"},{lat:47.6,lng:-122.3,name:"Seattle, USA"},{lat:25.8,lng:-80.2,name:"Miami, USA"},{lat:36.8,lng:10.2,name:"Tunis, Tunisia"},{lat:32.9,lng:-117.2,name:"San Diego, USA"}];for(let i=0;i<490;i++){const n=e[Math.floor(Math.random()*e.length)],c=e[Math.floor(Math.random()*e.length)];n!==c&&a.push({name:`Cable-${i+11}`,owner:"Various Consortium",landing_point_1:{latitude:n.lat+(Math.random()-.5)*2,longitude:n.lng+(Math.random()-.5)*2,location:n.name},landing_point_2:{latitude:c.lat+(Math.random()-.5)*2,longitude:c.lng+(Math.random()-.5)*2,location:c.name},capacity_tbps:Math.floor(Math.random()*100)+10,status:Math.random()>.1?"active":"planned",year:2015+Math.floor(Math.random()*9),data_accuracy:"estimated"})}return[...t,...a]}generateDataCenters(){const t=[{name:"Equinix NY9",latitude:40.7128,longitude:-74.006,city:"New York",country:"USA",tier:1,provider:"Equinix",data_accuracy:"live"},{name:"Digital Realty LON1",latitude:51.5074,longitude:-.1278,city:"London",country:"UK",tier:1,provider:"Digital Realty",data_accuracy:"live"},{name:"NTT Tokyo 1",latitude:35.6762,longitude:139.6503,city:"Tokyo",country:"Japan",tier:1,provider:"NTT",data_accuracy:"live"},{name:"Equinix SG3",latitude:1.3521,longitude:103.8198,city:"Singapore",country:"Singapore",tier:1,provider:"Equinix",data_accuracy:"live"},{name:"Interxion FRA1",latitude:50.1109,longitude:8.6821,city:"Frankfurt",country:"Germany",tier:1,provider:"Interxion",data_accuracy:"live"},{name:"CoreSite LA1",latitude:34.0522,longitude:-118.2437,city:"Los Angeles",country:"USA",tier:1,provider:"CoreSite",data_accuracy:"live"},{name:"Global Switch Sydney",latitude:-33.8688,longitude:151.2093,city:"Sydney",country:"Australia",tier:1,provider:"Global Switch",data_accuracy:"live"},{name:"Teraco JB1",latitude:-26.2041,longitude:28.0473,city:"Johannesburg",country:"South Africa",tier:1,provider:"Teraco",data_accuracy:"live"},{name:"QTS Chicago",latitude:41.8781,longitude:-87.6298,city:"Chicago",country:"USA",tier:2,provider:"QTS",data_accuracy:"estimated"},{name:"Vantage Mumbai",latitude:19.076,longitude:72.8777,city:"Mumbai",country:"India",tier:2,provider:"Vantage",data_accuracy:"estimated"},{name:"ODATA São Paulo",latitude:-23.5505,longitude:-46.6333,city:"São Paulo",country:"Brazil",tier:2,provider:"ODATA",data_accuracy:"estimated"},{name:"Telehouse Paris",latitude:48.8566,longitude:2.3522,city:"Paris",country:"France",tier:2,provider:"Telehouse",data_accuracy:"estimated"},{name:"China Telecom Beijing",latitude:39.9042,longitude:116.4074,city:"Beijing",country:"China",tier:2,provider:"China Telecom",data_accuracy:"estimated"},{name:"Etisalat Dubai",latitude:25.2048,longitude:55.2708,city:"Dubai",country:"UAE",tier:2,provider:"Etisalat",data_accuracy:"estimated"},{name:"KPN Amsterdam",latitude:52.3676,longitude:4.9041,city:"Amsterdam",country:"Netherlands",tier:2,provider:"KPN",data_accuracy:"estimated"}],a=[{lat:37.7749,lng:-122.4194,name:"San Francisco",country:"USA"},{lat:47.6062,lng:-122.3321,name:"Seattle",country:"USA"},{lat:39.0458,lng:-77.6413,name:"Ashburn",country:"USA"},{lat:33.4484,lng:-112.074,name:"Phoenix",country:"USA"},{lat:51.4545,lng:-.9787,name:"Reading",country:"UK"},{lat:53.4808,lng:-2.2426,name:"Manchester",country:"UK"},{lat:59.3293,lng:18.0686,name:"Stockholm",country:"Sweden"},{lat:55.6761,lng:12.5683,name:"Copenhagen",country:"Denmark"},{lat:45.5017,lng:-73.5673,name:"Montreal",country:"Canada"},{lat:43.6532,lng:-79.3832,name:"Toronto",country:"Canada"},{lat:22.3193,lng:114.1694,name:"Hong Kong",country:"China"},{lat:37.5665,lng:126.978,name:"Seoul",country:"South Korea"},{lat:28.6139,lng:77.209,name:"Delhi",country:"India"},{lat:12.9716,lng:77.5946,name:"Bangalore",country:"India"}],e=[];for(let i=0;i<7985;i++){const n=a[Math.floor(Math.random()*a.length)],c=Math.random()<.1?1:Math.random()<.4?2:3;e.push({name:`DC-${n.name}-${i}`,latitude:n.lat+(Math.random()-.5)*.5,longitude:n.lng+(Math.random()-.5)*.5,city:n.name,country:n.country,tier:c,provider:["Generic Provider","Local ISP","Cloud Provider"][Math.floor(Math.random()*3)],data_accuracy:"estimated"})}return[...t,...e]}generateBGPRoutes(){const t=[{asn:"AS15169",name:"Google",lat:37.4,lng:-122},{asn:"AS32934",name:"Facebook",lat:37.5,lng:-122.2},{asn:"AS16509",name:"Amazon",lat:47.6,lng:-122.3},{asn:"AS8075",name:"Microsoft",lat:47.6,lng:-122.1},{asn:"AS13335",name:"Cloudflare",lat:37.8,lng:-122.4},{asn:"AS2914",name:"NTT",lat:35.7,lng:139.7},{asn:"AS3356",name:"Level3",lat:39.7,lng:-104.9},{asn:"AS1299",name:"Telia",lat:59.3,lng:18.1},{asn:"AS6939",name:"Hurricane Electric",lat:37.4,lng:-121.9},{asn:"AS4134",name:"China Telecom",lat:39.9,lng:116.4}],a=[];for(let e=0;e<50;e++){const i=t[Math.floor(Math.random()*t.length)],n=t[Math.floor(Math.random()*t.length)];i!==n&&a.push({source:i,destination:n,traffic_gbps:Math.floor(Math.random()*150)+10,asn:i.asn,path_length:Math.floor(Math.random()*5)+2})}return{activeRoutes:425e3+Math.floor(Math.random()*5e4),routes:a,lastUpdate:new Date().toISOString()}}generateDDoSAttack(){const t=[{lat:40.7,lng:-74,name:"Financial Services NYC"},{lat:51.5,lng:-.1,name:"European Bank London"},{lat:35.7,lng:139.7,name:"Gaming Server Tokyo"},{lat:37.4,lng:-122,name:"Tech Company SV"},{lat:1.3,lng:103.8,name:"E-commerce Singapore"},{lat:-23.5,lng:-46.6,name:"Media Service Brazil"},{lat:52.5,lng:13.4,name:"Government Site Berlin"},{lat:55.8,lng:37.6,name:"News Portal Moscow"}];return{target:t[Math.floor(Math.random()*t.length)],magnitude:Math.floor(Math.random()*100)+10,type:["Volumetric","TCP State Exhaustion","Application Layer"][Math.floor(Math.random()*3)],sources:Math.floor(Math.random()*1e4)+1e3,timestamp:new Date().toISOString(),accuracy:"simulated"}}async loadSubmarineCables(){try{const t=this.dataCache.get("cables");if(t)return t;const a=this.fallbackData.cables;return this.dataCache.set("cables",a),a}catch(t){return console.warn("Using fallback submarine cable data:",t),this.fallbackData.cables}}async loadDataCenters(){try{const t=this.dataCache.get("datacenters");if(t)return t;const a=this.fallbackData.datacenters;return this.dataCache.set("datacenters",a),a}catch(t){return console.warn("Using fallback data center data:",t),this.fallbackData.datacenters}}async loadBGPRoutes(){try{return this.generateBGPRoutes()}catch(t){return console.warn("Using simulated BGP data:",t),this.fallbackData.bgpRoutes}}async fetchLiveData(t,a){try{const e=await fetch(`${t}${a}`,{headers:{Accept:"application/json"}});if(!e.ok)throw new Error(`HTTP error! status: ${e.status}`);return await e.json()}catch(e){return console.warn(`Failed to fetch from ${t}:`,e),null}}}class G{constructor(){this.container=document.getElementById("globe-container"),this.globe=null,this.dataManager=new U,this.originalData={cables:[],datacenters:[]},this.allCables=[],this.allDatacenters=[],this.design={colors:{primary:"rgba(0, 200, 255, 0.6)",secondary:"rgba(255, 100, 150, 0.4)",tertiary:"rgba(150, 200, 100, 0.3)",accent:"rgba(255, 200, 50, 0.5)",datacenter:"rgba(255, 255, 255, 0.8)"},cable:{maxStroke:2,minStroke:.5,maxAltitude:.25,minAltitude:.08}},this.stats={cables:0,datacenters:0},this.init()}async init(){this.setupLoadingScreen(),await this.createCleanGlobe(),await this.loadCleanData(),this.setupMinimalControls(),this.hideLoadingScreen()}setupLoadingScreen(){const t=document.getElementById("loading-screen");if(t){const a=t.querySelector(".loading-content");a&&(a.innerHTML=`
          <div style="text-align: center;">
            <div style="
              width: 60px;
              height: 60px;
              border: 2px solid rgba(0, 200, 255, 0.2);
              border-top-color: rgba(0, 200, 255, 0.8);
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
            "></div>
            <h2 style="font-weight: 300; font-size: 1.5rem; color: #fff;">
              Loading Infrastructure Data
            </h2>
            <p style="color: #666; font-size: 0.9rem;" class="loading-status">
              Initializing globe...
            </p>
          </div>
          <style>
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          </style>
        `)}}async createCleanGlobe(){return new Promise(t=>{this.globe=w().globeImageUrl("//unpkg.com/three-globe/example/img/earth-dark.jpg").showAtmosphere(!0).atmosphereColor("rgba(100, 150, 200, 0.15)").atmosphereAltitude(.2).backgroundColor("rgba(0, 0, 0, 0)").onGlobeReady(()=>{this.setupCleanScene(),t()}),this.globe(this.container),this.globe.pointOfView({lat:20,lng:-40,altitude:2.8},0)})}setupCleanScene(){const t=this.globe.scene(),a=this.globe.renderer(),e=this.globe.controls(),i=this.globe.camera();a.antialias=!0,a.toneMapping=M,a.toneMappingExposure=.8,a.setPixelRatio(window.devicePixelRatio),i.near=.1,i.far=1e4,i.updateProjectionMatrix(),e.autoRotate=!0,e.autoRotateSpeed=.5,e.enableDamping=!0,e.dampingFactor=.05,e.rotateSpeed=.5,e.zoomSpeed=.8,e.minDistance=120,e.maxDistance=500,t.traverse(u=>{u instanceof L&&t.remove(u)});const n=new x(16777215,.4);t.add(n);const c=new E(16777215,.3);c.position.set(50,50,50),t.add(c),this.addSubtleStars(t)}addSubtleStars(t){const a=new A,e=new T({color:16777215,size:.3,transparent:!0,opacity:.3}),i=[];for(let n=0;n<2e3;n++){const c=Math.random()*Math.PI*2,u=Math.acos(2*Math.random()-1),o=600;i.push(o*Math.sin(u)*Math.cos(c),o*Math.sin(u)*Math.sin(c),o*Math.cos(u))}a.setAttribute("position",new B(i,3)),t.add(new k(a,e))}async loadCleanData(){try{this.updateLoadingStatus("Loading submarine cables...");const t=await this.dataManager.loadSubmarineCables();this.allCables=t;const a={accuracy:"all",region:"all",capacity:"all",majorOnly:!1};this.renderCleanCables(t,a),this.updateLoadingStatus("Loading data centers...");const e=await this.dataManager.loadDataCenters();this.renderMinimalDataCenters(e),this.updateStats()}catch(t){console.error("Data loading error:",t)}}renderCleanCables(t,a={}){const{accuracy:e="all",region:i="all",capacity:n="all",majorOnly:c=!1}=a;let o=c?t.filter(r=>r.capacity_tbps>100||r.name.includes("MAREA")||r.name.includes("Grace")||r.name.includes("2Africa")):this.selectImportantCables(t);console.log(`Starting with ${o.length} cables`),e==="live"?(o=o.filter(r=>r.data_accuracy==="live"),console.log(`After accuracy filter (live): ${o.length} cables`)):e==="estimated"&&(o=o.filter(r=>r.data_accuracy!=="live"),console.log(`After accuracy filter (estimated): ${o.length} cables`)),i!=="all"&&(o.length,o=o.filter(r=>{const s=(r.landing_point_1.longitude+r.landing_point_2.longitude)/2,d=(r.landing_point_1.latitude+r.landing_point_2.latitude)/2,p=this.calculateDistance(r.landing_point_1.latitude,r.landing_point_1.longitude,r.landing_point_2.latitude,r.landing_point_2.longitude),m=r.landing_point_1.longitude,h=r.landing_point_2.longitude,v=r.landing_point_1.latitude,_=r.landing_point_2.latitude,y=r.landing_point_1.location||"",g=r.landing_point_2.location||"";switch(i){case"transatlantic":return(m<-40&&h>-20&&h<30||h<-40&&m>-20&&m<30)&&p>2e3;case"transpacific":return Math.abs(m-h)>120&&(m>100||m<-100||h>100||h<-100)&&p>3e3;case"europe-asia":return(m>-10&&m<50&&h>50||h>-10&&h<50&&m>50)&&p>1e3;case"americas-internal":return m<-30&&h<-30&&p<8e3;case"europe-internal":return m>-15&&m<50&&h>-15&&h<50&&v>35&&_>35&&p<4e3;case"asia-internal":return m>60&&h>60&&p<6e3;case"africa-connected":return y.includes("Africa")||g.includes("Africa")||y.includes("Cape Town")||g.includes("Cape Town")||y.includes("Cairo")||g.includes("Cairo")||y.includes("Lagos")||g.includes("Lagos")||y.includes("Nairobi")||g.includes("Nairobi")||s>-20&&s<55&&d<35&&d>-35;default:return!0}}),console.log(`After region filter (${i}): ${o.length} cables`)),n!=="all"&&(o.length,o=o.filter(r=>{const s=r.capacity_tbps||0;switch(n){case"high":return s>150;case"medium":return s>=50&&s<=150;case"low":return s<50;default:return!0}}),console.log(`After capacity filter (${n}): ${o.length} cables`)),console.log(`Final filtered cables: ${o.length}`);const l=o.map(r=>{const s=this.calculateImportance(r),d=.85+s*.15;let p=parseFloat(r.landing_point_1.latitude),m=parseFloat(r.landing_point_1.longitude),h=parseFloat(r.landing_point_2.latitude),v=parseFloat(r.landing_point_2.longitude);if(isNaN(p)||isNaN(m)||isNaN(h)||isNaN(v))return null;m=(m+180)%360-180,v=(v+180)%360-180;const _=this.calculateDistance(p,m,h,v);let y;return _>15e3?y=.5+(_-15e3)/5e3*.2:_>1e4?y=.35:_>5e3?y=.25:_>2e3?y=.15:_>1e3?y=.08:y=.04,{startLat:p,startLng:m,endLat:h,endLng:v,startLocation:r.landing_point_1.location||null,endLocation:r.landing_point_2.location||null,color:this.getCableColor(r,d),stroke:Math.max(.8,this.getCableStroke(s)),altitude:y,label:r.name,capacity:r.capacity_tbps,owner:r.owner,status:r.status,accuracy:r.data_accuracy||"estimated",importance:s}}).filter(r=>r!==null);l.sort((r,s)=>r.importance-s.importance),this.originalData.cables=l,console.log(`Rendering ${l.length} cable arcs`),this.globe.arcsData(l).arcStartLat("startLat").arcStartLng("startLng").arcEndLat("endLat").arcEndLng("endLng").arcColor("color").arcStroke("stroke").arcAltitude("altitude").arcDashLength(0).arcDashGap(0).arcDashAnimateTime(0).arcCurveResolution(64).arcsTransitionDuration(0).arcLabel(r=>this.createCleanTooltip(r)),this.stats.cables=o.length}selectImportantCables(t){const a=[],e=new Set,i=["MAREA","Grace Hopper","2Africa","Dunant","FASTER","Pacific Light Cable Network","JUPITER","SEA-ME-WE 5","EllaLink","Australia-Singapore Cable"];t.forEach(c=>{c.name&&i.some(u=>c.name.includes(u))&&(a.push({...c,data_accuracy:c.data_accuracy||"estimated"}),e.add(c.name))}),t.filter(c=>!e.has(c.name)&&c.capacity_tbps>30).slice(0,100).forEach(c=>{a.push({...c,data_accuracy:c.data_accuracy||"estimated"}),e.add(c.name)}),t.filter(c=>!e.has(c.name)&&c.capacity_tbps>10).slice(0,50).forEach(c=>{a.push({...c,data_accuracy:c.data_accuracy||"estimated"}),e.add(c.name)});const n=this.groupByRegion(t);return Object.values(n).forEach(c=>{c.filter(u=>!e.has(u.name)).slice(0,5).forEach(u=>{a.push({...u,data_accuracy:u.data_accuracy||"estimated"}),e.add(u.name)})}),t}groupByRegion(t){const a={atlantic:[],pacific:[],indian:[],mediterranean:[],caribbean:[],other:[]};return t.forEach(e=>{const i=(e.landing_point_1.longitude+e.landing_point_2.longitude)/2,n=(e.landing_point_1.latitude+e.landing_point_2.latitude)/2;i>-100&&i<-20&&Math.abs(n)<60?a.atlantic.push(e):i>100||i<-100?a.pacific.push(e):i>20&&i<100&&n<30?a.indian.push(e):i>-20&&i<45&&n>30&&n<45?a.mediterranean.push(e):i>-90&&i<-60&&n>10&&n<30?a.caribbean.push(e):a.other.push(e)}),a}calculateImportance(t){let a=0;t.capacity_tbps>200?a+=.4:t.capacity_tbps>100?a+=.3:t.capacity_tbps>50?a+=.2:a+=.1;const e=this.calculateDistance(t.landing_point_1.latitude,t.landing_point_1.longitude,t.landing_point_2.latitude,t.landing_point_2.longitude);return e>8e3?a+=.3:e>5e3?a+=.2:e>2e3&&(a+=.1),t.status==="active"?a+=.3:t.status==="planned"&&(a+=.1),Math.min(a,1)}calculateDistance(t,a,e,i){const c=(e-t)*Math.PI/180,u=(i-a)*Math.PI/180,o=Math.sin(c/2)*Math.sin(c/2)+Math.cos(t*Math.PI/180)*Math.cos(e*Math.PI/180)*Math.sin(u/2)*Math.sin(u/2);return 6371*(2*Math.atan2(Math.sqrt(o),Math.sqrt(1-o)))}getCableColor(t,a){const e=t.capacity_tbps||50,n=Math.max(.6,a);return e>150?`rgba(0, 255, 204, ${n})`:e>=50&&e<=150?`rgba(255, 204, 0, ${n})`:`rgba(255, 0, 255, ${n})`}getCableColorForPath(t){const a=t.capacity||t.capacity_tbps||50;return a>150?"#00ffcc":a>=50?"#ffcc00":"#ff00ff"}getCableStroke(t){return .8+t*(2-.8)}getCableAltitude(t){return this.design.cable.minAltitude+t*(this.design.cable.maxAltitude-this.design.cable.minAltitude)}createMinimalTooltip(t){const a=t.importance||0,e=a>.7?"rgba(0, 200, 255, 0.8)":a>.4?"rgba(150, 150, 255, 0.6)":"rgba(200, 200, 200, 0.4)",i=t.accuracy==="live"?"🟢":t.accuracy==="estimated"?"🟡":"⚪",n=this.calculateDistance(t.startLat,t.startLng,t.endLat,t.endLng).toFixed(0);return`
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
        padding: 16px;
        background: linear-gradient(135deg, rgba(10, 10, 20, 0.95), rgba(20, 20, 40, 0.95));
        border: 2px solid ${e};
        border-radius: 12px;
        font-size: 13px;
        color: #fff;
        min-width: 280px;
        backdrop-filter: blur(20px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px ${e};
      ">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        ">
          <div style="
            font-weight: 600;
            font-size: 15px;
            color: ${e};
            text-shadow: 0 0 10px ${e};
          ">
            ${t.label||"Submarine Cable"}
          </div>
          <div style="
            font-size: 11px;
            color: rgba(255, 255, 255, 0.6);
          ">
            ${i} ${t.accuracy||"Unknown"}
          </div>
        </div>
        
        <div style="
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 8px;
          font-size: 12px;
          line-height: 1.6;
        ">
          <span style="color: rgba(255, 255, 255, 0.5);">From:</span>
          <span style="
            color: #fff;
            text-align: right;
            font-size: 11px;
          ">
            ${t.startLocation||`${t.startLat.toFixed(2)}°, ${t.startLng.toFixed(2)}°`}
          </span>
          
          <span style="color: rgba(255, 255, 255, 0.5);">To:</span>
          <span style="
            color: #fff;
            text-align: right;
            font-size: 11px;
          ">
            ${t.endLocation||`${t.endLat.toFixed(2)}°, ${t.endLng.toFixed(2)}°`}
          </span>
          
          <span style="color: rgba(255, 255, 255, 0.5);">Capacity:</span>
          <span style="
            color: #fff;
            font-weight: 500;
            text-align: right;
          ">
            ${t.capacity?`${t.capacity} Tbps`:"Not specified"}
          </span>
          
          <span style="color: rgba(255, 255, 255, 0.5);">Distance:</span>
          <span style="
            color: #fff;
            text-align: right;
          ">
            ~${n} km
          </span>
          
          <span style="color: rgba(255, 255, 255, 0.5);">Owner:</span>
          <span style="
            color: #fff;
            text-align: right;
            font-size: 11px;
          ">
            ${t.owner?t.owner.substring(0,30)+(t.owner.length>30?"...":""):"Consortium"}
          </span>
          
          <span style="color: rgba(255, 255, 255, 0.5);">Status:</span>
          <span style="
            color: ${t.status==="active"?"#00ff88":"#ffaa00"};
            text-align: right;
            font-weight: 500;
          ">
            ${(t.status||"Active").toUpperCase()}
          </span>
        </div>
        
        <div style="
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div style="
            font-size: 10px;
            color: rgba(255, 255, 255, 0.4);
          ">
            Landing Points
          </div>
          <div style="
            font-size: 10px;
            color: rgba(255, 255, 255, 0.6);
            text-align: right;
          ">
            ${t.startLat.toFixed(1)}°, ${t.startLng.toFixed(1)}° → 
            ${t.endLat.toFixed(1)}°, ${t.endLng.toFixed(1)}°
          </div>
        </div>
      </div>
    `}renderMinimalDataCenters(t,a="all"){this.allDatacenters=t;let e=t;a==="tier1"?e=t.filter(l=>l.tier===1):a==="tier2"?e=t.filter(l=>l.tier===2):a==="tier3"&&(e=t.filter(l=>l.tier===3));const i=e.filter(l=>l.tier===1).slice(0,50),n=e.filter(l=>l.tier===2).slice(0,30),c=e.filter(l=>l.tier===3).slice(0,20),o=[...i,...n,...c].map(l=>({lat:l.latitude,lng:l.longitude,size:l.tier===1?.5:l.tier===2?.35:.25,color:l.tier===1?"rgba(0, 255, 204, 0.9)":l.tier===2?"rgba(255, 204, 0, 0.8)":"rgba(255, 0, 255, 0.7)",label:`${l.city}, ${l.country}`,name:l.name,city:l.city,country:l.country,tier:l.tier,provider:l.provider,accuracy:l.data_accuracy}));this.originalData.datacenters=o,this.globe.pointsData(o).pointLat("lat").pointLng("lng").pointColor("color").pointAltitude(.01).pointRadius("size").pointLabel(l=>this.createDataCenterTooltip(l)),this.stats.datacenters=o.length}createCleanTooltip(t){const a=this.calculateDistance(t.startLat,t.startLng,t.endLat,t.endLng),e=t.accuracy==="live"?"🟢":t.accuracy==="estimated"?"🟡":"⚪",i=t.capacity>150?"#00ffcc":t.capacity>50?"#ffcc00":"#ff00ff";return`
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
        padding: 16px;
        background: linear-gradient(135deg, rgba(10, 10, 20, 0.98), rgba(20, 15, 30, 0.98));
        border: 2px solid ${i};
        border-radius: 12px;
        font-size: 12px;
        color: #fff;
        min-width: 280px;
        max-width: 350px;
        backdrop-filter: blur(20px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px ${i}33;
      ">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        ">
          <div style="
            font-weight: 600;
            font-size: 15px;
            color: ${i};
            text-shadow: 0 0 10px ${i};
          ">
            ${t.label||"Submarine Cable"}
          </div>
          <div style="
            font-size: 11px;
            color: rgba(255, 255, 255, 0.6);
          ">
            ${e} ${t.accuracy||"Unknown"}
          </div>
        </div>
        
        <div style="
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 8px;
          font-size: 12px;
          line-height: 1.6;
        ">
          <span style="color: rgba(255, 255, 255, 0.5);">From:</span>
          <span style="
            color: #fff;
            text-align: right;
            font-size: 11px;
          ">
            ${t.startLocation||`${t.startLat.toFixed(2)}°, ${t.startLng.toFixed(2)}°`}
          </span>
          
          <span style="color: rgba(255, 255, 255, 0.5);">To:</span>
          <span style="
            color: #fff;
            text-align: right;
            font-size: 11px;
          ">
            ${t.endLocation||`${t.endLat.toFixed(2)}°, ${t.endLng.toFixed(2)}°`}
          </span>
          
          <span style="color: rgba(255, 255, 255, 0.5);">Capacity:</span>
          <span style="
            color: #fff;
            font-weight: 500;
            text-align: right;
          ">
            ${t.capacity?`${t.capacity} Tbps`:"Not specified"}
          </span>
          
          <span style="color: rgba(255, 255, 255, 0.5);">Distance:</span>
          <span style="
            color: #fff;
            text-align: right;
          ">
            ~${Math.round(a)} km
          </span>
          
          <span style="color: rgba(255, 255, 255, 0.5);">Owner:</span>
          <span style="
            color: #fff;
            text-align: right;
            font-size: 11px;
          ">
            ${t.owner?t.owner.substring(0,30)+(t.owner.length>30?"...":""):"Consortium"}
          </span>
          
          <span style="color: rgba(255, 255, 255, 0.5);">Status:</span>
          <span style="
            color: ${t.status==="active"?"#00ff88":"#ffaa00"};
            text-align: right;
            font-weight: 500;
          ">
            ${(t.status||"Active").toUpperCase()}
          </span>
        </div>
      </div>
    `}createDataCenterTooltip(t){const a=t.accuracy==="live"?"🟢":t.accuracy==="estimated"?"🟡":"⚪";return`
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
        padding: 14px;
        background: linear-gradient(135deg, rgba(10, 10, 20, 0.95), rgba(30, 20, 40, 0.95));
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 10px;
        font-size: 12px;
        color: #fff;
        min-width: 240px;
        backdrop-filter: blur(20px);
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 255, 255, 0.1);
      ">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        ">
          <div style="
            font-weight: 600;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.9);
          ">
            ${t.name||"Data Center"}
          </div>
          <div style="
            font-size: 10px;
            color: rgba(255, 255, 255, 0.5);
          ">
            ${a} ${t.accuracy||"estimated"}
          </div>
        </div>
        
        <div style="
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 6px;
          font-size: 11px;
        ">
          <span style="color: rgba(255, 255, 255, 0.5);">Location:</span>
          <span style="color: #fff; text-align: right;">
            ${t.city}, ${t.country}
          </span>
          
          <span style="color: rgba(255, 255, 255, 0.5);">Tier:</span>
          <span style="
            color: #00ffcc;
            text-align: right;
            font-weight: 500;
          ">
            Tier ${t.tier}
          </span>
          
          <span style="color: rgba(255, 255, 255, 0.5);">Provider:</span>
          <span style="color: #fff; text-align: right; font-size: 10px;">
            ${t.provider||"Unknown"}
          </span>
        </div>
        
        <div style="
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 9px;
          color: rgba(255, 255, 255, 0.4);
          text-align: center;
        ">
          ${t.lat.toFixed(4)}°, ${t.lng.toFixed(4)}°
        </div>
      </div>
    `}renderCablesAsCustomLines(t,a={}){let e=this.applyFilters(t,a);this.cableGroup&&this.globe.scene().remove(this.cableGroup),this.cableGroup=new D,e.forEach(i=>{const n=[],u=i.landing_point_1.latitude*Math.PI/180,o=i.landing_point_1.longitude*Math.PI/180,l=i.landing_point_2.latitude*Math.PI/180,r=i.landing_point_2.longitude*Math.PI/180,s=50;for(let h=0;h<=s;h++){const v=h/s,_=Math.sin(u)*(1-v)+Math.sin(l)*v,y=Math.sqrt(1-_*_),g=o+(r-o)*v,b=100*y*Math.cos(g),f=100*_,S=100*y*Math.sin(g);n.push(new F(b,f,S))}const d=new A().setFromPoints(n),p=new I({color:new $(i.color||65484),linewidth:2,transparent:!0,opacity:.8}),m=new P(d,p);this.cableGroup.add(m)}),this.globe.scene().add(this.cableGroup),this.originalData.cables=e,this.stats.cables=e.length}applyFilters(t,a){const{accuracy:e="all",region:i="all",capacity:n="all",majorOnly:c=!1}=a;let u=c?t.filter(o=>o.capacity_tbps>100||o.name.includes("MAREA")||o.name.includes("Grace")||o.name.includes("2Africa")):this.selectImportantCables(t);return e==="live"?u=u.filter(o=>o.data_accuracy==="live"):e==="estimated"&&(u=u.filter(o=>o.data_accuracy!=="live")),u}renderCablesAsLines(t,a={}){const{accuracy:e="all",region:i="all",capacity:n="all",majorOnly:c=!1}=a;let u=c?t.filter(l=>l.capacity_tbps>100||l.name.includes("MAREA")||l.name.includes("Grace")||l.name.includes("2Africa")):this.selectImportantCables(t);e==="live"?u=u.filter(l=>l.data_accuracy==="live"):e==="estimated"&&(u=u.filter(l=>l.data_accuracy!=="live")),i!=="all"&&(u=u.filter(l=>{const r=l.landing_point_1.latitude,s=l.landing_point_1.longitude,d=l.landing_point_2.latitude,p=l.landing_point_2.longitude;switch(i){case"transatlantic":return(s<-40&&p>-20||p<-40&&s>-20)&&Math.abs(r-d)<30;case"transpacific":return Math.abs(s-p)>100&&(s>100||s<-100)&&(p>100||p<-100);case"europe-asia":return(s<40&&p>40||p<40&&s>40)&&r>20&&d>0;case"americas-internal":return s<-30&&p<-30;case"europe-internal":return s>-10&&s<40&&p>-10&&p<40&&r>35&&d>35;case"asia-internal":return s>60&&p>60;case"africa-connected":return r<35&&r>-35&&s>-20&&s<55||d<35&&d>-35&&p>-20&&p<55;default:return!0}})),n!=="all"&&(u=u.filter(l=>{const r=l.capacity_tbps||50;switch(n){case"high":return r>150;case"medium":return r>=50&&r<=150;case"low":return r<50;default:return!0}}));const o=u.map(l=>{const r=[],s=l.landing_point_1.latitude,d=l.landing_point_1.longitude,p=l.landing_point_2.latitude,m=l.landing_point_2.longitude,h=50;for(let y=0;y<=h;y++){const g=y/h,b=s+(p-s)*g,f=d+(m-d)*g,S=Math.sin(g*Math.PI)*.02;r.push([b,f,S])}const v=l.capacity_tbps?l.capacity_tbps/200:.5,_=.3+v*.4;return{coords:r,color:this.getCableColor(l,_),stroke:Math.max(.5,v*2),label:l.name,cable:l}});this.globe.pathsData(o).pathPoints("coords").pathColor("color").pathStroke("stroke").pathDashLength(0).pathDashGap(0).pathDashAnimateTime(0).pathLabel(l=>this.createMinimalTooltip(l.cable)).pathTransitionDuration(1500),this.stats.cables=o.length,this.originalData.cables=o}setupInfoTooltips(){var n,c,u;const t=o=>{const l=document.getElementById(o);l&&(document.querySelectorAll(".info-tooltip").forEach(r=>{r.id!==o&&r.classList.add("hidden")}),l.classList.toggle("hidden"))},a=document.getElementById("major-cables-info");a==null||a.addEventListener("click",o=>{o.preventDefault(),o.stopPropagation(),t("major-cables-tooltip")});const e=document.getElementById("capacity-info");e==null||e.addEventListener("click",o=>{o.preventDefault(),o.stopPropagation(),t("capacity-tooltip")});const i=document.getElementById("tiers-info");i==null||i.addEventListener("click",o=>{o.preventDefault(),o.stopPropagation(),t("tiers-tooltip")}),(n=document.getElementById("close-major-tooltip"))==null||n.addEventListener("click",()=>{var o;(o=document.getElementById("major-cables-tooltip"))==null||o.classList.add("hidden")}),(c=document.getElementById("close-capacity-tooltip"))==null||c.addEventListener("click",()=>{var o;(o=document.getElementById("capacity-tooltip"))==null||o.classList.add("hidden")}),(u=document.getElementById("close-tiers-tooltip"))==null||u.addEventListener("click",()=>{var o;(o=document.getElementById("tiers-tooltip"))==null||o.classList.add("hidden")}),document.addEventListener("click",o=>{!o.target.closest(".info-icon")&&!o.target.closest(".info-tooltip")&&document.querySelectorAll(".info-tooltip").forEach(l=>{l.classList.add("hidden")})})}setupListView(){const t=document.getElementById("list-view-toggle"),a=document.getElementById("list-view-modal"),e=document.getElementById("list-view-close"),i=document.getElementById("export-csv"),n=document.getElementById("cable-tbody"),c=document.getElementById("filtered-count"),u=document.getElementById("total-count"),o=()=>{var p,m,h,v;const s={accuracy:((p=document.getElementById("cable-filter"))==null?void 0:p.value)||"all",region:((m=document.getElementById("region-filter"))==null?void 0:m.value)||"all",capacity:((h=document.getElementById("capacity-filter"))==null?void 0:h.value)||"all",majorOnly:((v=document.getElementById("show-major-only"))==null?void 0:v.checked)||!1};let d=[...this.allCables];return s.majorOnly&&(d=d.filter(_=>_.capacity_tbps>100||_.name.includes("MAREA")||_.name.includes("Grace")||_.name.includes("2Africa"))),s.accuracy==="live"?d=d.filter(_=>_.data_accuracy==="live"):s.accuracy==="estimated"&&(d=d.filter(_=>_.data_accuracy!=="live")),s.region!=="all"&&(d=d.filter(_=>{const y=_.landing_point_1.latitude,g=_.landing_point_1.longitude,b=_.landing_point_2.latitude,f=_.landing_point_2.longitude;switch(s.region){case"transatlantic":return(g<-40&&f>-20||f<-40&&g>-20)&&Math.abs(y-b)<30;case"transpacific":return Math.abs(g-f)>100&&(g>100||g<-100)&&(f>100||f<-100);case"europe-asia":return(g<40&&f>40||f<40&&g>40)&&y>20&&b>0;case"americas-internal":return g<-30&&f<-30;case"europe-internal":return g>-10&&g<40&&f>-10&&f<40&&y>35&&b>35;case"asia-internal":return g>60&&f>60;case"africa-connected":return y<35&&y>-35&&g>-20&&g<55||b<35&&b>-35&&f>-20&&f<55;default:return!0}})),s.capacity!=="all"&&(d=d.filter(_=>{const y=_.capacity_tbps||50;switch(s.capacity){case"high":return y>150;case"medium":return y>=50&&y<=150;case"low":return y<50;default:return!0}})),d},l=()=>{const s=o();c&&(c.textContent=s.length),u&&(u.textContent=this.allCables.length),n&&(n.innerHTML="",s.forEach(d=>{const p=this.calculateDistance(d.landing_point_1.latitude,d.landing_point_1.longitude,d.landing_point_2.latitude,d.landing_point_2.longitude),m=document.createElement("tr");m.innerHTML=`
            <td>${d.name||"Unknown Cable"}</td>
            <td>${d.capacity_tbps?d.capacity_tbps.toFixed(1):"N/A"}</td>
            <td>${Math.round(p)}</td>
            <td>${d.landing_point_1.location||`${d.landing_point_1.latitude.toFixed(1)}°, ${d.landing_point_1.longitude.toFixed(1)}°`}</td>
            <td>${d.landing_point_2.location||`${d.landing_point_2.latitude.toFixed(1)}°, ${d.landing_point_2.longitude.toFixed(1)}°`}</td>
            <td class="status-${d.status||"active"}">${(d.status||"Active").toUpperCase()}</td>
            <td class="accuracy-${d.data_accuracy==="live"?"live":"estimated"}">${d.data_accuracy==="live"?"Live":"Estimated"}</td>
          `,n.appendChild(m)}))};t==null||t.addEventListener("click",()=>{a&&(a.classList.remove("hidden"),l())}),e==null||e.addEventListener("click",()=>{a&&a.classList.add("hidden")}),a==null||a.addEventListener("click",s=>{s.target===a&&a.classList.add("hidden")}),i==null||i.addEventListener("click",()=>{const s=o(),d=this.exportToCSV(s);this.downloadCSV(d,"submarine_cables_export.csv")}),document.querySelectorAll("#cable-table th.sortable").forEach(s=>{s.addEventListener("click",()=>{s.dataset.sort;const d=Array.from(n.querySelectorAll("tr"));d.sort((p,m)=>{const h=p.children[s.cellIndex].textContent,v=m.children[s.cellIndex].textContent;return h.localeCompare(v,void 0,{numeric:!0})}),n.innerHTML="",d.forEach(p=>n.appendChild(p))})})}exportToCSV(t){const a=["Name","Capacity (Tbps)","Distance (km)","From","To","Status","Data Accuracy"],e=t.map(n=>{const c=this.calculateDistance(n.landing_point_1.latitude,n.landing_point_1.longitude,n.landing_point_2.latitude,n.landing_point_2.longitude);return[n.name||"Unknown",n.capacity_tbps||"N/A",Math.round(c),n.landing_point_1.location||`${n.landing_point_1.latitude.toFixed(1)}°, ${n.landing_point_1.longitude.toFixed(1)}°`,n.landing_point_2.location||`${n.landing_point_2.latitude.toFixed(1)}°, ${n.landing_point_2.longitude.toFixed(1)}°`,n.status||"Active",n.data_accuracy==="live"?"Live":"Estimated"]});return[a,...e].map(n=>n.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join(`
`)}downloadCSV(t,a){const e=new Blob([t],{type:"text/csv;charset=utf-8;"}),i=document.createElement("a"),n=URL.createObjectURL(e);i.setAttribute("href",n),i.setAttribute("download",a),i.style.visibility="hidden",document.body.appendChild(i),i.click(),document.body.removeChild(i)}setupMinimalControls(){var l,r,s,d,p,m,h,v,_,y;this.setupListView(),this.setupInfoTooltips();const t=document.getElementById("rotation-toggle"),a=t==null?void 0:t.querySelector(".play-icon"),e=t==null?void 0:t.querySelector(".pause-icon");t==null||t.addEventListener("click",()=>{const g=this.globe.controls();g.autoRotate=!g.autoRotate,g.update(),g.autoRotate?(a.style.display="none",e.style.display="block"):(a.style.display="block",e.style.display="none")});const i=()=>{var g,b,f,S;return{accuracy:((g=document.getElementById("cable-filter"))==null?void 0:g.value)||"all",region:((b=document.getElementById("region-filter"))==null?void 0:b.value)||"all",capacity:((f=document.getElementById("capacity-filter"))==null?void 0:f.value)||"all",majorOnly:((S=document.getElementById("show-major-only"))==null?void 0:S.checked)||!1}},n=()=>{const g=i();console.log("Applying filters:",g),this.renderCleanCables(this.allCables,g);const b=document.getElementById("cable-count");if(b){const f=this.originalData.cables.length,S=this.allCables.length;b.textContent=`${f}/${S}`}};(l=document.getElementById("cable-filter"))==null||l.addEventListener("change",n),(r=document.getElementById("region-filter"))==null||r.addEventListener("change",n),(s=document.getElementById("capacity-filter"))==null||s.addEventListener("change",n),(d=document.getElementById("show-major-only"))==null||d.addEventListener("change",n),(p=document.getElementById("toggle-cables"))==null||p.addEventListener("change",g=>{if(g.target.checked){console.log("Toggling cables ON, total cables:",this.allCables.length);const b=i();this.renderCleanCables(this.allCables,b)}else{console.log("Toggling cables OFF"),this.globe.arcsData([]);const b=document.getElementById("cable-count");b&&(b.textContent=`0/${this.allCables.length}`)}});const c=()=>{var b,f;if((b=document.getElementById("toggle-datacenters"))==null?void 0:b.checked){const S=((f=document.getElementById("datacenter-filter"))==null?void 0:f.value)||"all";this.renderMinimalDataCenters(this.allDatacenters,S)}else this.globe.pointsData([])};(m=document.getElementById("toggle-datacenters"))==null||m.addEventListener("change",c),(h=document.getElementById("datacenter-filter"))==null||h.addEventListener("change",c),(v=document.getElementById("toggle-atmosphere"))==null||v.addEventListener("change",g=>{this.globe.showAtmosphere(g.target.checked)});const u=document.getElementById("cable-glow");(_=u==null?void 0:u.parentElement)!=null&&_.parentElement&&(u.parentElement.parentElement.style.display="none");const o=document.getElementById("flow-speed");(y=o==null?void 0:o.parentElement)!=null&&y.parentElement&&(o.parentElement.parentElement.style.display="none"),document.addEventListener("keydown",g=>{(g.key==="r"||g.key==="R")&&this.globe.pointOfView({lat:20,lng:-40,altitude:2.8},1e3)}),window.addEventListener("resize",()=>{this.globe.width(window.innerWidth),this.globe.height(window.innerHeight)})}updateLoadingStatus(t){const a=document.querySelector(".loading-status");a&&(a.textContent=t)}hideLoadingScreen(){const t=document.getElementById("loading-screen");t&&setTimeout(()=>{t.style.opacity="0",t.style.transition="opacity 1s ease",setTimeout(()=>{t.style.display="none"},1e3)},500)}updateStats(){document.getElementById("cable-count").textContent=this.stats.cables,document.getElementById("datacenter-count").textContent=this.stats.datacenters}}document.addEventListener("DOMContentLoaded",()=>{new G});
//# sourceMappingURL=index-CvO6op9R.js.map

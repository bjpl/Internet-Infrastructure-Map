import{j as $}from"./globe-BDvu76SH.js";import{L as P,a as U,A as F,D as G,B as I,P as N,F as R,b as z,G as O,c as j,C as H,d as V,V as q}from"./three-vPXGKxFS.js";import"./d3-BzNBBN38.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))e(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&e(r)}).observe(document,{childList:!0,subtree:!0});function a(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function e(i){if(i.ep)return;i.ep=!0;const o=a(i);fetch(i.href,o)}})();class K{constructor(){this.dataCache=new Map,this.dataSources={peeringDB:"https://www.peeringdb.com/api/",hurricaneElectric:"https://bgp.he.net/api/",submarineCableMap:"https://www.submarinecablemap.com/api/v3/",cloudflareRadar:"https://radar.cloudflare.com/api/"},this.fallbackData=this.initializeFallbackData()}initializeFallbackData(){return{cables:this.generateSubmarineCables(),datacenters:this.generateDataCenters(),bgpRoutes:this.generateBGPRoutes()}}generateSubmarineCables(){const t=[{name:"MAREA",owner:"Microsoft, Facebook, Telxius",landing_point_1:{latitude:36.8,longitude:-75.9,location:"Virginia Beach, USA"},landing_point_2:{latitude:43.4,longitude:-8.2,location:"Bilbao, Spain"},capacity_tbps:200,status:"active",year:2017,data_accuracy:"live"},{name:"Grace Hopper",owner:"Google",landing_point_1:{latitude:40.5,longitude:-74.2,location:"New York, USA"},landing_point_2:{latitude:50.6,longitude:-1.3,location:"Bude, UK"},capacity_tbps:250,status:"active",year:2022,data_accuracy:"live"},{name:"2Africa",owner:"Meta, MTN, Orange, Vodafone",landing_point_1:{latitude:51.5,longitude:-.1,location:"London, UK"},landing_point_2:{latitude:-33.9,longitude:18.4,location:"Cape Town, South Africa"},capacity_tbps:180,status:"active",year:2023,data_accuracy:"live"},{name:"Pacific Light Cable Network",owner:"Google, Facebook",landing_point_1:{latitude:22.3,longitude:114.2,location:"Hong Kong"},landing_point_2:{latitude:34,longitude:-118.2,location:"Los Angeles, USA"},capacity_tbps:144,status:"active",year:2018,data_accuracy:"live"},{name:"JUPITER",owner:"Amazon, NTT, Softbank",landing_point_1:{latitude:35.7,longitude:139.7,location:"Tokyo, Japan"},landing_point_2:{latitude:34,longitude:-118.2,location:"Los Angeles, USA"},capacity_tbps:60,status:"active",year:2020,data_accuracy:"live"},{name:"Dunant",owner:"Google",landing_point_1:{latitude:36.8,longitude:-75.9,location:"Virginia Beach, USA"},landing_point_2:{latitude:44.4,longitude:-1.2,location:"Saint-Hilaire-de-Riez, France"},capacity_tbps:250,status:"active",year:2020,data_accuracy:"live"},{name:"EllaLink",owner:"EllaLink Group",landing_point_1:{latitude:-23,longitude:-43.2,location:"Fortaleza, Brazil"},landing_point_2:{latitude:38.7,longitude:-9.1,location:"Sines, Portugal"},capacity_tbps:100,status:"active",year:2021,data_accuracy:"estimated"},{name:"SEA-ME-WE 5",owner:"Consortium",landing_point_1:{latitude:1.3,longitude:103.8,location:"Singapore"},landing_point_2:{latitude:43.7,longitude:7.3,location:"Marseille, France"},capacity_tbps:24,status:"active",year:2016,data_accuracy:"live"},{name:"FASTER",owner:"Google, KDDI, SingTel",landing_point_1:{latitude:35.5,longitude:139.8,location:"Chiba, Japan"},landing_point_2:{latitude:45.6,longitude:-122.6,location:"Oregon, USA"},capacity_tbps:60,status:"active",year:2016,data_accuracy:"live"},{name:"Australia-Singapore Cable",owner:"Vocus, Superloop",landing_point_1:{latitude:-31.9,longitude:115.9,location:"Perth, Australia"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:40,status:"active",year:2018,data_accuracy:"estimated"},{name:"TAT-14",owner:"AT&T, BT, Deutsche Telekom, France Telecom, Sprint",landing_point_1:{latitude:40.5,longitude:-74,location:"Manasquan, USA"},landing_point_2:{latitude:52.4,longitude:1.7,location:"Blaricum, Netherlands"},capacity_tbps:40,status:"active",year:2001,data_accuracy:"live"},{name:"FLAG Atlantic-1",owner:"Reliance Globalcom",landing_point_1:{latitude:40.5,longitude:-74,location:"New York, USA"},landing_point_2:{latitude:51.5,longitude:-.1,location:"London, UK"},capacity_tbps:30,status:"active",year:2e3,data_accuracy:"live"},{name:"Amitié",owner:"Meta, Microsoft, Orange, Vodafone",landing_point_1:{latitude:41.9,longitude:-70,location:"Lynn, USA"},landing_point_2:{latitude:44.4,longitude:-1.2,location:"Le Porge, France"},capacity_tbps:400,status:"active",year:2023,data_accuracy:"live"},{name:"Equiano",owner:"Google",landing_point_1:{latitude:38.7,longitude:-9.1,location:"Lisbon, Portugal"},landing_point_2:{latitude:-33.9,longitude:18.4,location:"Cape Town, South Africa"},capacity_tbps:144,status:"active",year:2022,data_accuracy:"live"},{name:"PEACE Cable",owner:"PCCW Global, Hengtong Group",landing_point_1:{latitude:24.5,longitude:54.4,location:"Gwadar, Pakistan"},landing_point_2:{latitude:43.7,longitude:7.3,location:"Marseille, France"},capacity_tbps:180,status:"active",year:2022,data_accuracy:"live"},{name:"Southern Cross NEXT",owner:"Southern Cross Cables",landing_point_1:{latitude:-33.9,longitude:151.2,location:"Sydney, Australia"},landing_point_2:{latitude:34,longitude:-118.2,location:"Los Angeles, USA"},capacity_tbps:72,status:"active",year:2022,data_accuracy:"live"},{name:"INDIGO-West",owner:"Telstra, Singtel, SubPartners",landing_point_1:{latitude:-31.9,longitude:115.9,location:"Perth, Australia"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:36,status:"active",year:2019,data_accuracy:"live"},{name:"Asia-America Gateway (AAG)",owner:"AT&T, NTT, PLDT, Singtel, others",landing_point_1:{latitude:21.3,longitude:-157.9,location:"Hawaii, USA"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:20,status:"active",year:2009,data_accuracy:"live"},{name:"Echo",owner:"Google, Meta",landing_point_1:{latitude:33.6,longitude:-117.9,location:"Eureka, USA"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:240,status:"planned",year:2024,data_accuracy:"estimated"},{name:"Bifrost",owner:"Meta, Keppel, Telin",landing_point_1:{latitude:37.8,longitude:-122.4,location:"San Francisco, USA"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:190,status:"planned",year:2024,data_accuracy:"estimated"},{name:"Atlantic Crossing-1 (AC-1)",owner:"Lumen Technologies",landing_point_1:{latitude:40.6,longitude:-74,location:"Brookhaven, USA"},landing_point_2:{latitude:52.9,longitude:-3,location:"Whitesands Bay, UK"},capacity_tbps:40,status:"active",year:1998,data_accuracy:"live"},{name:"Apollo",owner:"Vodafone, Orange, Meta",landing_point_1:{latitude:50.6,longitude:-1.3,location:"Bude, UK"},landing_point_2:{latitude:40.6,longitude:-74,location:"Brookhaven, USA"},capacity_tbps:200,status:"active",year:2020,data_accuracy:"live"},{name:"MAREA",owner:"Microsoft, Meta, Telxius",landing_point_1:{latitude:36.8,longitude:-75.9,location:"Virginia Beach, USA"},landing_point_2:{latitude:43.4,longitude:-8.2,location:"Bilbao, Spain"},capacity_tbps:200,status:"active",year:2017,data_accuracy:"live"},{name:"Dunant",owner:"Google",landing_point_1:{latitude:36.8,longitude:-75.9,location:"Virginia Beach, USA"},landing_point_2:{latitude:44.4,longitude:-1.2,location:"Saint-Hilaire-de-Riez, France"},capacity_tbps:250,status:"active",year:2020,data_accuracy:"live"},{name:"Havfrue/AEC-2",owner:"Aqua Comms, Meta, Google, Bulk Infrastructure",landing_point_1:{latitude:39.3,longitude:-74.5,location:"Wall Township, USA"},landing_point_2:{latitude:55.4,longitude:8.4,location:"Blaabjerg, Denmark"},capacity_tbps:108,status:"active",year:2019,data_accuracy:"live"},{name:"EllaLink",owner:"EllaLink Group",landing_point_1:{latitude:-23,longitude:-43.2,location:"Praia Grande, Brazil"},landing_point_2:{latitude:38.7,longitude:-9.4,location:"Sines, Portugal"},capacity_tbps:72,status:"active",year:2021,data_accuracy:"live"},{name:"Curie",owner:"Google",landing_point_1:{latitude:33,longitude:-117.3,location:"Hermosa Beach, USA"},landing_point_2:{latitude:-33,longitude:-71.6,location:"Valparaiso, Chile"},capacity_tbps:72,status:"active",year:2019,data_accuracy:"live"},{name:"Junior",owner:"Google, ALDA Marine, Sparkle",landing_point_1:{latitude:-22.9,longitude:-43.2,location:"Rio de Janeiro, Brazil"},landing_point_2:{latitude:-34.9,longitude:-56.2,location:"Punta del Este, Uruguay"},capacity_tbps:60,status:"active",year:2018,data_accuracy:"live"},{name:"Tannat",owner:"Google, Antel",landing_point_1:{latitude:-34.5,longitude:-54.9,location:"Maldonado, Uruguay"},landing_point_2:{latitude:-23.5,longitude:-46.3,location:"Santos, Brazil"},capacity_tbps:90,status:"active",year:2018,data_accuracy:"live"},{name:"Monet",owner:"Google, Antel, Angola Cables, Algar Telecom",landing_point_1:{latitude:-23.9,longitude:-46.3,location:"Praia Grande, Brazil"},landing_point_2:{latitude:26.5,longitude:-78.7,location:"Boca Raton, USA"},capacity_tbps:64,status:"active",year:2017,data_accuracy:"live"},{name:"SAEx1",owner:"SAEx International",landing_point_1:{latitude:-33.9,longitude:18.4,location:"Cape Town, South Africa"},landing_point_2:{latitude:-23.5,longitude:-46.6,location:"Santos, Brazil"},capacity_tbps:32,status:"active",year:2018,data_accuracy:"estimated"},{name:"BRUSA",owner:"Telxius",landing_point_1:{latitude:-22.9,longitude:-43.2,location:"Rio de Janeiro, Brazil"},landing_point_2:{latitude:36.8,longitude:-75.9,location:"Virginia Beach, USA"},capacity_tbps:138,status:"active",year:2018,data_accuracy:"live"},{name:"WASACE",owner:"Angola Cables",landing_point_1:{latitude:-8.8,longitude:13.2,location:"Luanda, Angola"},landing_point_2:{latitude:-33.9,longitude:18.4,location:"Cape Town, South Africa"},capacity_tbps:40,status:"active",year:2018,data_accuracy:"estimated"},{name:"SACS",owner:"Angola Cables",landing_point_1:{latitude:-8.8,longitude:13.2,location:"Luanda, Angola"},landing_point_2:{latitude:-3.7,longitude:-38.5,location:"Fortaleza, Brazil"},capacity_tbps:40,status:"active",year:2018,data_accuracy:"estimated"},{name:"Malbec",owner:"GlobeNet, Meta",landing_point_1:{latitude:-34.6,longitude:-58.4,location:"Las Toninas, Argentina"},landing_point_2:{latitude:-23,longitude:-43.2,location:"Praia Grande, Brazil"},capacity_tbps:48,status:"active",year:2022,data_accuracy:"live"},{name:"Firmina",owner:"Google",landing_point_1:{latitude:33.8,longitude:-118.4,location:"Dockweiler Beach, USA"},landing_point_2:{latitude:-34.6,longitude:-58.4,location:"Las Toninas, Argentina"},capacity_tbps:240,status:"planned",year:2024,data_accuracy:"estimated"},{name:"JUPITER",owner:"NTT, Google, PLDT, PCCW, Softbank, Meta",landing_point_1:{latitude:35.3,longitude:139.8,location:"Maruyama, Japan"},landing_point_2:{latitude:34,longitude:-118.5,location:"Hermosa Beach, USA"},capacity_tbps:60,status:"active",year:2020,data_accuracy:"live"},{name:"FASTER",owner:"Google, KDDI, Singtel, China Mobile, China Telecom",landing_point_1:{latitude:36.6,longitude:138.2,location:"Shima, Japan"},landing_point_2:{latitude:45.6,longitude:-123.9,location:"Bandon, USA"},capacity_tbps:60,status:"active",year:2016,data_accuracy:"live"},{name:"PLCN",owner:"Google, Meta",landing_point_1:{latitude:34,longitude:-118.5,location:"El Segundo, USA"},landing_point_2:{latitude:25.1,longitude:121.5,location:"Toucheng, Taiwan"},capacity_tbps:144,status:"active",year:2019,data_accuracy:"live"},{name:"New Cross Pacific (NCP)",owner:"Microsoft, China Mobile, China Telecom, China Unicom, KT Corporation",landing_point_1:{latitude:45.6,longitude:-123.9,location:"Pacific City, USA"},landing_point_2:{latitude:31.2,longitude:121.5,location:"Shanghai, China"},capacity_tbps:80,status:"active",year:2018,data_accuracy:"live"},{name:"SEA-ME-WE 5",owner:"Consortium of 20+ carriers",landing_point_1:{latitude:1.3,longitude:103.8,location:"Singapore"},landing_point_2:{latitude:43.3,longitude:5.4,location:"Marseille, France"},capacity_tbps:24,status:"active",year:2016,data_accuracy:"live"},{name:"SEA-ME-WE 4",owner:"Consortium of 16 carriers",landing_point_1:{latitude:1.3,longitude:103.8,location:"Singapore"},landing_point_2:{latitude:43.3,longitude:5.4,location:"Marseille, France"},capacity_tbps:40,status:"active",year:2005,data_accuracy:"live"},{name:"Asia Africa Europe-1 (AAE-1)",owner:"Consortium of 19 carriers",landing_point_1:{latitude:22.3,longitude:114.2,location:"Hong Kong"},landing_point_2:{latitude:43.3,longitude:5.4,location:"Marseille, France"},capacity_tbps:40,status:"active",year:2017,data_accuracy:"live"},{name:"APG",owner:"Consortium including China Telecom, NTT, PLDT",landing_point_1:{latitude:35.4,longitude:139.6,location:"Chikura, Japan"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:54,status:"active",year:2016,data_accuracy:"live"},{name:"SJC",owner:"Consortium including Google, KDDI, Singtel",landing_point_1:{latitude:35.1,longitude:139.8,location:"Chikura, Japan"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:28,status:"active",year:2013,data_accuracy:"live"},{name:"Unity",owner:"Google, KDDI, Singtel, Bharti, Global Transit",landing_point_1:{latitude:35.1,longitude:139.8,location:"Chikura, Japan"},landing_point_2:{latitude:34,longitude:-118.5,location:"Redondo Beach, USA"},capacity_tbps:10,status:"active",year:2010,data_accuracy:"live"},{name:"TGN-Pacific",owner:"Tata Communications",landing_point_1:{latitude:35.4,longitude:139.8,location:"Emi, Japan"},landing_point_2:{latitude:45.6,longitude:-123.9,location:"Nedonna Beach, USA"},capacity_tbps:5.12,status:"active",year:2002,data_accuracy:"estimated"},{name:"FALCON",owner:"Global Cloud Xchange",landing_point_1:{latitude:19.1,longitude:72.9,location:"Mumbai, India"},landing_point_2:{latitude:30,longitude:31.2,location:"Cairo, Egypt"},capacity_tbps:5.12,status:"active",year:2006,data_accuracy:"estimated"},{name:"IMEWE",owner:"Consortium of 9 carriers",landing_point_1:{latitude:19.1,longitude:72.9,location:"Mumbai, India"},landing_point_2:{latitude:43.3,longitude:5.4,location:"Marseille, France"},capacity_tbps:5.12,status:"active",year:2010,data_accuracy:"estimated"},{name:"Bay of Bengal Gateway (BBG)",owner:"Vodafone, Reliance, Dialog, Etisalat",landing_point_1:{latitude:13.1,longitude:80.3,location:"Chennai, India"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:10,status:"active",year:2015,data_accuracy:"live"},{name:"i2i",owner:"Bharti Airtel, Singtel",landing_point_1:{latitude:13.1,longitude:80.3,location:"Chennai, India"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:8.4,status:"active",year:2002,data_accuracy:"estimated"},{name:"MENA",owner:"Orascom Telecom, Telecom Italia",landing_point_1:{latitude:31.2,longitude:29.9,location:"Alexandria, Egypt"},landing_point_2:{latitude:45.4,longitude:12.3,location:"Venice, Italy"},capacity_tbps:5.12,status:"active",year:2011,data_accuracy:"estimated"},{name:"RAMAN",owner:"Telekom Malaysia, Symphony",landing_point_1:{latitude:2.2,longitude:102.2,location:"Melaka, Malaysia"},landing_point_2:{latitude:19.1,longitude:72.9,location:"Mumbai, India"},capacity_tbps:100,status:"planned",year:2024,data_accuracy:"estimated"},{name:"PEACE",owner:"PEACE Cable International",landing_point_1:{latitude:24.5,longitude:67,location:"Karachi, Pakistan"},landing_point_2:{latitude:43.3,longitude:5.4,location:"Marseille, France"},capacity_tbps:96,status:"active",year:2022,data_accuracy:"live"},{name:"Australia-Singapore Cable (ASC)",owner:"Vocus, Superloop, Google, AARNet",landing_point_1:{latitude:-31.9,longitude:115.8,location:"Perth, Australia"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:40,status:"active",year:2018,data_accuracy:"live"},{name:"INDIGO-Central",owner:"Consortium including Google, Telstra, Singtel",landing_point_1:{latitude:-31.9,longitude:115.8,location:"Perth, Australia"},landing_point_2:{latitude:1.3,longitude:103.8,location:"Singapore"},capacity_tbps:36,status:"active",year:2019,data_accuracy:"live"},{name:"SeaMeWe-3",owner:"Consortium of 90+ carriers",landing_point_1:{latitude:52.4,longitude:4.3,location:"Norden, Germany"},landing_point_2:{latitude:35.7,longitude:139.7,location:"Tokyo, Japan"},capacity_tbps:5,status:"active",year:1999,data_accuracy:"historical"},{name:"Hawaiki",owner:"BW Digital",landing_point_1:{latitude:-36.8,longitude:174.7,location:"Auckland, New Zealand"},landing_point_2:{latitude:45.2,longitude:-123.9,location:"Pacific City, USA"},capacity_tbps:43.8,status:"active",year:2018,data_accuracy:"live"},{name:"Southern Cross NEXT",owner:"Southern Cross Cables",landing_point_1:{latitude:-33.9,longitude:151.2,location:"Sydney, Australia"},landing_point_2:{latitude:34,longitude:-118.5,location:"Hermosa Beach, USA"},capacity_tbps:72,status:"active",year:2022,data_accuracy:"live"}],a=[],e=[{lat:51.5,lng:-.1,name:"London, UK"},{lat:40.7,lng:-74,name:"New York, USA"},{lat:35.7,lng:139.7,name:"Tokyo, Japan"},{lat:1.3,lng:103.8,name:"Singapore"},{lat:-33.9,lng:18.4,name:"Cape Town, South Africa"},{lat:-23.5,lng:-46.6,name:"São Paulo, Brazil"},{lat:25,lng:55.3,name:"Dubai, UAE"},{lat:-33.9,lng:151.2,name:"Sydney, Australia"},{lat:19.4,lng:-99.1,name:"Mexico City, Mexico"},{lat:13.1,lng:80.3,name:"Chennai, India"},{lat:22.3,lng:114.2,name:"Hong Kong, China"},{lat:34,lng:-118.2,name:"Los Angeles, USA"},{lat:37.8,lng:-122.4,name:"San Francisco, USA"},{lat:52.5,lng:13.4,name:"Berlin, Germany"},{lat:48.9,lng:2.3,name:"Paris, France"},{lat:41.9,lng:12.5,name:"Rome, Italy"},{lat:55.8,lng:37.6,name:"Moscow, Russia"},{lat:39.9,lng:116.4,name:"Beijing, China"},{lat:31.2,lng:121.5,name:"Shanghai, China"},{lat:19.1,lng:72.9,name:"Mumbai, India"},{lat:-6.2,lng:106.8,name:"Jakarta, Indonesia"},{lat:14.6,lng:121,name:"Manila, Philippines"},{lat:13.8,lng:100.5,name:"Bangkok, Thailand"},{lat:3.1,lng:101.7,name:"Kuala Lumpur, Malaysia"},{lat:37.6,lng:127,name:"Seoul, South Korea"},{lat:43.7,lng:-79.4,name:"Toronto, Canada"},{lat:45.5,lng:-73.6,name:"Montreal, Canada"},{lat:49.3,lng:-123.1,name:"Vancouver, Canada"},{lat:-34.6,lng:-58.4,name:"Buenos Aires, Argentina"},{lat:30,lng:31.2,name:"Cairo, Egypt"},{lat:-1.3,lng:36.8,name:"Nairobi, Kenya"},{lat:6.5,lng:3.4,name:"Lagos, Nigeria"},{lat:59.3,lng:18.1,name:"Stockholm, Sweden"},{lat:55.7,lng:12.6,name:"Copenhagen, Denmark"},{lat:52.4,lng:4.9,name:"Amsterdam, Netherlands"},{lat:50.8,lng:4.4,name:"Brussels, Belgium"},{lat:40.4,lng:-3.7,name:"Madrid, Spain"},{lat:38.7,lng:-9.1,name:"Lisbon, Portugal"},{lat:53.3,lng:-6.3,name:"Dublin, Ireland"},{lat:36.8,lng:-75.9,name:"Virginia Beach, USA"},{lat:44.4,lng:-1.2,name:"Saint-Hilaire-de-Riez, France"},{lat:50.6,lng:-1.3,name:"Bude, UK"},{lat:43.4,lng:-8.2,name:"Bilbao, Spain"},{lat:38,lng:-122.8,name:"Point Arena, USA"},{lat:41.8,lng:-87.6,name:"Chicago, USA"},{lat:39,lng:-77.5,name:"Ashburn, USA"},{lat:47.6,lng:-122.3,name:"Seattle, USA"},{lat:25.8,lng:-80.2,name:"Miami, USA"},{lat:36.8,lng:10.2,name:"Tunis, Tunisia"},{lat:32.9,lng:-117.2,name:"San Diego, USA"}];for(let i=0;i<490;i++){const o=e[Math.floor(Math.random()*e.length)],r=e[Math.floor(Math.random()*e.length)];o!==r&&a.push({name:`Cable-${i+11}`,owner:"Various Consortium",landing_point_1:{latitude:o.lat+(Math.random()-.5)*2,longitude:o.lng+(Math.random()-.5)*2,location:o.name},landing_point_2:{latitude:r.lat+(Math.random()-.5)*2,longitude:r.lng+(Math.random()-.5)*2,location:r.name},capacity_tbps:Math.floor(Math.random()*100)+10,status:Math.random()>.1?"active":"planned",year:2015+Math.floor(Math.random()*9),data_accuracy:"estimated"})}return[...t,...a]}generateDataCenters(){return[{name:"Equinix NY9",latitude:40.7128,longitude:-74.006,city:"New York",country:"USA",tier:1,provider:"Equinix",data_accuracy:"live"},{name:"Digital Realty LON1",latitude:51.5074,longitude:-.1278,city:"London",country:"UK",tier:1,provider:"Digital Realty",data_accuracy:"live"},{name:"NTT Tokyo 1",latitude:35.6762,longitude:139.6503,city:"Tokyo",country:"Japan",tier:1,provider:"NTT",data_accuracy:"live"},{name:"Equinix SG3",latitude:1.3521,longitude:103.8198,city:"Singapore",country:"Singapore",tier:1,provider:"Equinix",data_accuracy:"live"},{name:"Interxion FRA1",latitude:50.1109,longitude:8.6821,city:"Frankfurt",country:"Germany",tier:1,provider:"Interxion",data_accuracy:"live"},{name:"CoreSite LA1",latitude:34.0522,longitude:-118.2437,city:"Los Angeles",country:"USA",tier:1,provider:"CoreSite",data_accuracy:"live"},{name:"Global Switch Sydney",latitude:-33.8688,longitude:151.2093,city:"Sydney",country:"Australia",tier:1,provider:"Global Switch",data_accuracy:"live"},{name:"Teraco JB1",latitude:-26.2041,longitude:28.0473,city:"Johannesburg",country:"South Africa",tier:1,provider:"Teraco",data_accuracy:"live"},{name:"QTS Chicago",latitude:41.8781,longitude:-87.6298,city:"Chicago",country:"USA",tier:2,provider:"QTS",data_accuracy:"estimated"},{name:"Vantage Mumbai",latitude:19.076,longitude:72.8777,city:"Mumbai",country:"India",tier:2,provider:"Vantage",data_accuracy:"estimated"},{name:"ODATA São Paulo",latitude:-23.5505,longitude:-46.6333,city:"São Paulo",country:"Brazil",tier:2,provider:"ODATA",data_accuracy:"estimated"},{name:"Telehouse Paris",latitude:48.8566,longitude:2.3522,city:"Paris",country:"France",tier:2,provider:"Telehouse",data_accuracy:"estimated"},{name:"China Telecom Beijing",latitude:39.9042,longitude:116.4074,city:"Beijing",country:"China",tier:2,provider:"China Telecom",data_accuracy:"estimated"},{name:"Etisalat Dubai",latitude:25.2048,longitude:55.2708,city:"Dubai",country:"UAE",tier:2,provider:"Etisalat",data_accuracy:"estimated"},{name:"KPN Amsterdam",latitude:52.3676,longitude:4.9041,city:"Amsterdam",country:"Netherlands",tier:2,provider:"KPN",data_accuracy:"estimated"},{name:"Equinix DC1",latitude:39.0458,longitude:-77.4875,city:"Ashburn",country:"USA",tier:1,provider:"Equinix",data_accuracy:"live"},{name:"Switch SUPERNAP",latitude:36.1699,longitude:-115.1398,city:"Las Vegas",country:"USA",tier:1,provider:"Switch",data_accuracy:"live"},{name:"Equinix HK1",latitude:22.3193,longitude:114.1694,city:"Hong Kong",country:"China",tier:1,provider:"Equinix",data_accuracy:"live"},{name:"NextDC S1",latitude:-33.8688,longitude:151.2093,city:"Sydney",country:"Australia",tier:1,provider:"NextDC",data_accuracy:"live"},{name:"Cologix MTL3",latitude:45.5017,longitude:-73.5673,city:"Montreal",country:"Canada",tier:2,provider:"Cologix",data_accuracy:"estimated"},{name:"CyrusOne Houston",latitude:29.7604,longitude:-95.3698,city:"Houston",country:"USA",tier:2,provider:"CyrusOne",data_accuracy:"estimated"},{name:"Iron Mountain Boston",latitude:42.3601,longitude:-71.0589,city:"Boston",country:"USA",tier:2,provider:"Iron Mountain",data_accuracy:"estimated"},{name:"Telecity Stockholm",latitude:59.3293,longitude:18.0686,city:"Stockholm",country:"Sweden",tier:2,provider:"Telecity",data_accuracy:"estimated"},{name:"Vantage Zurich",latitude:47.3769,longitude:8.5417,city:"Zurich",country:"Switzerland",tier:2,provider:"Vantage",data_accuracy:"estimated"},{name:"EdgeConneX Denver",latitude:39.7392,longitude:-104.9903,city:"Denver",country:"USA",tier:3,provider:"EdgeConneX",data_accuracy:"estimated"},{name:"DataBank Atlanta",latitude:33.749,longitude:-84.388,city:"Atlanta",country:"USA",tier:3,provider:"DataBank",data_accuracy:"estimated"},{name:"365 Data Centers Detroit",latitude:42.3314,longitude:-83.0458,city:"Detroit",country:"USA",tier:3,provider:"365 Data Centers",data_accuracy:"estimated"},{name:"Green House Data Cheyenne",latitude:41.14,longitude:-104.8202,city:"Cheyenne",country:"USA",tier:3,provider:"Green House Data",data_accuracy:"estimated"},{name:"Flexential Portland",latitude:45.5152,longitude:-122.6784,city:"Portland",country:"USA",tier:3,provider:"Flexential",data_accuracy:"estimated"}]}generateBGPRoutes(){const t=[{asn:"AS15169",name:"Google",lat:37.4,lng:-122},{asn:"AS32934",name:"Facebook",lat:37.5,lng:-122.2},{asn:"AS16509",name:"Amazon",lat:47.6,lng:-122.3},{asn:"AS8075",name:"Microsoft",lat:47.6,lng:-122.1},{asn:"AS13335",name:"Cloudflare",lat:37.8,lng:-122.4},{asn:"AS2914",name:"NTT",lat:35.7,lng:139.7},{asn:"AS3356",name:"Level3",lat:39.7,lng:-104.9},{asn:"AS1299",name:"Telia",lat:59.3,lng:18.1},{asn:"AS6939",name:"Hurricane Electric",lat:37.4,lng:-121.9},{asn:"AS4134",name:"China Telecom",lat:39.9,lng:116.4}],a=[];for(let e=0;e<50;e++){const i=t[Math.floor(Math.random()*t.length)],o=t[Math.floor(Math.random()*t.length)];i!==o&&a.push({source:i,destination:o,traffic_gbps:Math.floor(Math.random()*150)+10,asn:i.asn,path_length:Math.floor(Math.random()*5)+2})}return{activeRoutes:425e3+Math.floor(Math.random()*5e4),routes:a,lastUpdate:new Date().toISOString()}}generateDDoSAttack(){const t=[{lat:40.7,lng:-74,name:"Financial Services NYC"},{lat:51.5,lng:-.1,name:"European Bank London"},{lat:35.7,lng:139.7,name:"Gaming Server Tokyo"},{lat:37.4,lng:-122,name:"Tech Company SV"},{lat:1.3,lng:103.8,name:"E-commerce Singapore"},{lat:-23.5,lng:-46.6,name:"Media Service Brazil"},{lat:52.5,lng:13.4,name:"Government Site Berlin"},{lat:55.8,lng:37.6,name:"News Portal Moscow"}];return{target:t[Math.floor(Math.random()*t.length)],magnitude:Math.floor(Math.random()*100)+10,type:["Volumetric","TCP State Exhaustion","Application Layer"][Math.floor(Math.random()*3)],sources:Math.floor(Math.random()*1e4)+1e3,timestamp:new Date().toISOString(),accuracy:"simulated"}}async loadSubmarineCables(){try{const t=this.dataCache.get("cables");if(t)return t;const a=this.fallbackData.cables;return this.dataCache.set("cables",a),a}catch(t){return console.warn("Using fallback submarine cable data:",t),this.fallbackData.cables}}async loadDataCenters(){try{const t=this.dataCache.get("datacenters");if(t)return t;const a=this.fallbackData.datacenters;return this.dataCache.set("datacenters",a),a}catch(t){return console.warn("Using fallback data center data:",t),this.fallbackData.datacenters}}async loadBGPRoutes(){try{return this.generateBGPRoutes()}catch(t){return console.warn("Using simulated BGP data:",t),this.fallbackData.bgpRoutes}}async fetchLiveData(t,a){try{const e=await fetch(`${t}${a}`,{headers:{Accept:"application/json"}});if(!e.ok)throw new Error(`HTTP error! status: ${e.status}`);return await e.json()}catch(e){return console.warn(`Failed to fetch from ${t}:`,e),null}}}class J{constructor(){this.container=document.getElementById("globe-container"),this.globe=null,this.dataManager=new K,this.originalData={cables:[],datacenters:[]},this.allCables=[],this.allDatacenters=[],this.design={colors:{primary:"rgba(0, 200, 255, 0.6)",secondary:"rgba(255, 100, 150, 0.4)",tertiary:"rgba(150, 200, 100, 0.3)",accent:"rgba(255, 200, 50, 0.5)",datacenter:"rgba(255, 255, 255, 0.8)"},cable:{maxStroke:2,minStroke:.5,maxAltitude:.25,minAltitude:.08}},this.stats={cables:0,datacenters:0},this.init()}async init(){this.setupLoadingScreen(),await this.createCleanGlobe(),await this.loadCleanData(),this.setupMinimalControls(),this.hideLoadingScreen()}setupLoadingScreen(){const t=document.getElementById("loading-screen");if(t){const a=t.querySelector(".loading-content");a&&(a.innerHTML=`
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
        `)}}async createCleanGlobe(){return new Promise(t=>{this.globe=$().globeImageUrl("//unpkg.com/three-globe/example/img/earth-dark.jpg").showAtmosphere(!0).atmosphereColor("rgba(100, 150, 200, 0.15)").atmosphereAltitude(.2).backgroundColor("rgba(0, 0, 0, 0)").onGlobeReady(()=>{this.setupCleanScene(),t()}),this.globe(this.container),this.globe.pointOfView({lat:20,lng:-40,altitude:2.8},0)})}setupCleanScene(){const t=this.globe.scene(),a=this.globe.renderer(),e=this.globe.controls(),i=this.globe.camera();a.antialias=!0,a.toneMapping=P,a.toneMappingExposure=.8,a.setPixelRatio(window.devicePixelRatio),i.near=.1,i.far=1e4,i.updateProjectionMatrix(),e.autoRotate=!0,e.autoRotateSpeed=.5,e.enableDamping=!0,e.dampingFactor=.05,e.rotateSpeed=.5,e.zoomSpeed=.8,e.minDistance=120,e.maxDistance=500,t.traverse(d=>{d instanceof U&&t.remove(d)});const o=new F(16777215,.4);t.add(o);const r=new G(16777215,.3);r.position.set(50,50,50),t.add(r),this.addSubtleStars(t)}addSubtleStars(t){const a=new I,e=new N({color:16777215,size:.3,transparent:!0,opacity:.3}),i=[];for(let o=0;o<2e3;o++){const r=Math.random()*Math.PI*2,d=Math.acos(2*Math.random()-1),c=600;i.push(c*Math.sin(d)*Math.cos(r),c*Math.sin(d)*Math.sin(r),c*Math.cos(d))}a.setAttribute("position",new R(i,3)),t.add(new z(a,e))}async loadCleanData(){try{this.updateLoadingStatus("Loading submarine cables...");const t=await this.dataManager.loadSubmarineCables();this.allCables=t;const a={accuracy:"all",region:"all",capacity:"all",majorOnly:!1};this.renderCleanCables(t,a),this.updateLoadingStatus("Loading data centers...");const e=await this.dataManager.loadDataCenters();this.renderMinimalDataCenters(e),this.updateStats()}catch(t){console.error("Data loading error:",t)}}renderCleanCables(t,a={}){const{accuracy:e="all",region:i="all",capacity:o="all",majorOnly:r=!1}=a;let c=r?t.filter(n=>n.capacity_tbps>100||n.name.includes("MAREA")||n.name.includes("Grace")||n.name.includes("2Africa")):this.selectImportantCables(t);console.log(`Starting with ${c.length} cables`),e==="live"?(c=c.filter(n=>n.data_accuracy==="live"),console.log(`After accuracy filter (live): ${c.length} cables`)):e==="estimated"&&(c=c.filter(n=>n.data_accuracy!=="live"),console.log(`After accuracy filter (estimated): ${c.length} cables`)),i!=="all"&&(c.length,c=c.filter(n=>{const s=(n.landing_point_1.longitude+n.landing_point_2.longitude)/2,u=(n.landing_point_1.latitude+n.landing_point_2.latitude)/2,p=this.calculateDistance(n.landing_point_1.latitude,n.landing_point_1.longitude,n.landing_point_2.latitude,n.landing_point_2.longitude),h=n.landing_point_1.longitude,_=n.landing_point_2.longitude,C=n.landing_point_1.latitude,b=n.landing_point_2.latitude,f=n.landing_point_1.location||"",m=n.landing_point_2.location||"";switch(i){case"transatlantic":return(h<-40&&_>-20&&_<30||_<-40&&h>-20&&h<30)&&p>2e3;case"transpacific":return Math.abs(h-_)>120&&(h>100||h<-100||_>100||_<-100)&&p>3e3;case"europe-asia":return(h>-10&&h<50&&_>50||_>-10&&_<50&&h>50)&&p>1e3;case"americas-internal":return h<-30&&_<-30&&p<8e3;case"europe-internal":return h>-15&&h<50&&_>-15&&_<50&&C>35&&b>35&&p<4e3;case"asia-internal":return h>60&&_>60&&p<6e3;case"africa-connected":return f.includes("Africa")||m.includes("Africa")||f.includes("Cape Town")||m.includes("Cape Town")||f.includes("Cairo")||m.includes("Cairo")||f.includes("Lagos")||m.includes("Lagos")||f.includes("Nairobi")||m.includes("Nairobi")||s>-20&&s<55&&u<35&&u>-35;default:return!0}}),console.log(`After region filter (${i}): ${c.length} cables`)),o!=="all"&&(c.length,c=c.filter(n=>{const s=n.capacity_tbps||0;switch(o){case"high":return s>150;case"medium":return s>=50&&s<=150;case"low":return s<50;default:return!0}}),console.log(`After capacity filter (${o}): ${c.length} cables`)),console.log(`Final filtered cables: ${c.length}`);const l=c.map(n=>{const s=this.calculateImportance(n),u=.85+s*.15;let p=parseFloat(n.landing_point_1.latitude),h=parseFloat(n.landing_point_1.longitude),_=parseFloat(n.landing_point_2.latitude),C=parseFloat(n.landing_point_2.longitude);if(isNaN(p)||isNaN(h)||isNaN(_)||isNaN(C))return null;h=(h+180)%360-180,C=(C+180)%360-180;const b=this.calculateDistance(p,h,_,C);let f;return b>15e3?f=.5+(b-15e3)/5e3*.2:b>1e4?f=.35:b>5e3?f=.25:b>2e3?f=.15:b>1e3?f=.08:f=.04,{startLat:p,startLng:h,endLat:_,endLng:C,startLocation:n.landing_point_1.location||null,endLocation:n.landing_point_2.location||null,color:this.getCableColor(n,u),stroke:Math.max(.8,this.getCableStroke(s)),altitude:f,label:n.name,capacity:n.capacity_tbps,owner:n.owner,status:n.status,accuracy:n.data_accuracy||"estimated",importance:s}}).filter(n=>n!==null);l.sort((n,s)=>n.importance-s.importance),this.originalData.cables=l,console.log(`Rendering ${l.length} cable arcs`),this.globe.arcsData(l).arcStartLat("startLat").arcStartLng("startLng").arcEndLat("endLat").arcEndLng("endLng").arcColor("color").arcStroke("stroke").arcAltitude("altitude").arcDashLength(0).arcDashGap(0).arcDashAnimateTime(0).arcCurveResolution(64).arcsTransitionDuration(0).arcLabel(n=>this.createCleanTooltip(n)),this.stats.cables=c.length}selectImportantCables(t){const a=[],e=new Set,i=["MAREA","Grace Hopper","2Africa","Dunant","FASTER","Pacific Light Cable Network","JUPITER","SEA-ME-WE 5","EllaLink","Australia-Singapore Cable"];t.forEach(r=>{r.name&&i.some(d=>r.name.includes(d))&&(a.push({...r,data_accuracy:r.data_accuracy||"estimated"}),e.add(r.name))}),t.filter(r=>!e.has(r.name)&&r.capacity_tbps>30).slice(0,100).forEach(r=>{a.push({...r,data_accuracy:r.data_accuracy||"estimated"}),e.add(r.name)}),t.filter(r=>!e.has(r.name)&&r.capacity_tbps>10).slice(0,50).forEach(r=>{a.push({...r,data_accuracy:r.data_accuracy||"estimated"}),e.add(r.name)});const o=this.groupByRegion(t);return Object.values(o).forEach(r=>{r.filter(d=>!e.has(d.name)).slice(0,5).forEach(d=>{a.push({...d,data_accuracy:d.data_accuracy||"estimated"}),e.add(d.name)})}),t}groupByRegion(t){const a={atlantic:[],pacific:[],indian:[],mediterranean:[],caribbean:[],other:[]};return t.forEach(e=>{const i=(e.landing_point_1.longitude+e.landing_point_2.longitude)/2,o=(e.landing_point_1.latitude+e.landing_point_2.latitude)/2;i>-100&&i<-20&&Math.abs(o)<60?a.atlantic.push(e):i>100||i<-100?a.pacific.push(e):i>20&&i<100&&o<30?a.indian.push(e):i>-20&&i<45&&o>30&&o<45?a.mediterranean.push(e):i>-90&&i<-60&&o>10&&o<30?a.caribbean.push(e):a.other.push(e)}),a}calculateImportance(t){let a=0;t.capacity_tbps>200?a+=.4:t.capacity_tbps>100?a+=.3:t.capacity_tbps>50?a+=.2:a+=.1;const e=this.calculateDistance(t.landing_point_1.latitude,t.landing_point_1.longitude,t.landing_point_2.latitude,t.landing_point_2.longitude);return e>8e3?a+=.3:e>5e3?a+=.2:e>2e3&&(a+=.1),t.status==="active"?a+=.3:t.status==="planned"&&(a+=.1),Math.min(a,1)}calculateDistance(t,a,e,i){const r=(e-t)*Math.PI/180,d=(i-a)*Math.PI/180,c=Math.sin(r/2)*Math.sin(r/2)+Math.cos(t*Math.PI/180)*Math.cos(e*Math.PI/180)*Math.sin(d/2)*Math.sin(d/2);return 6371*(2*Math.atan2(Math.sqrt(c),Math.sqrt(1-c)))}getCableColor(t,a){const e=t.capacity_tbps||50,o=Math.max(.6,a);return e>150?`rgba(0, 255, 204, ${o})`:e>=50&&e<=150?`rgba(255, 204, 0, ${o})`:`rgba(255, 0, 255, ${o})`}getCableColorForPath(t){const a=t.capacity||t.capacity_tbps||50;return a>150?"#00ffcc":a>=50?"#ffcc00":"#ff00ff"}getCableStroke(t){return .8+t*(2-.8)}getCableAltitude(t){return this.design.cable.minAltitude+t*(this.design.cable.maxAltitude-this.design.cable.minAltitude)}createMinimalTooltip(t){const a=t.importance||0,e=a>.7?"rgba(0, 200, 255, 0.8)":a>.4?"rgba(150, 150, 255, 0.6)":"rgba(200, 200, 200, 0.4)",i=t.accuracy==="live"?"🟢":t.accuracy==="estimated"?"🟡":"⚪",o=this.calculateDistance(t.startLat,t.startLng,t.endLat,t.endLng).toFixed(0);return`
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
            ~${o} km
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
    `}renderMinimalDataCenters(t,a="all"){this.allDatacenters=t;let e=t;a==="tier1"?e=t.filter(l=>l.tier===1):a==="tier2"?e=t.filter(l=>l.tier===2):a==="tier3"&&(e=t.filter(l=>l.tier===3));const i=e.filter(l=>l.tier===1).slice(0,50),o=e.filter(l=>l.tier===2).slice(0,30),r=e.filter(l=>l.tier===3).slice(0,20),c=[...i,...o,...r].map(l=>({lat:l.latitude,lng:l.longitude,size:l.tier===1?.5:l.tier===2?.35:.25,color:l.tier===1?"rgba(0, 255, 204, 0.9)":l.tier===2?"rgba(255, 204, 0, 0.8)":"rgba(255, 0, 255, 0.7)",label:`${l.city}, ${l.country}`,name:l.name,city:l.city,country:l.country,tier:l.tier,provider:l.provider,accuracy:l.data_accuracy}));this.originalData.datacenters=c,this.globe.pointsData(c).pointLat("lat").pointLng("lng").pointColor("color").pointAltitude(.01).pointRadius("size").pointLabel(l=>this.createDataCenterTooltip(l)),this.stats.datacenters=c.length}createCleanTooltip(t){const a=this.calculateDistance(t.startLat,t.startLng,t.endLat,t.endLng),e=t.accuracy==="live"?"🟢":t.accuracy==="estimated"?"🟡":"⚪",i=t.capacity>150?"#00ffcc":t.capacity>50?"#ffcc00":"#ff00ff";return`
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
    `}renderCablesAsCustomLines(t,a={}){let e=this.applyFilters(t,a);this.cableGroup&&this.globe.scene().remove(this.cableGroup),this.cableGroup=new O,e.forEach(i=>{const o=[],d=i.landing_point_1.latitude*Math.PI/180,c=i.landing_point_1.longitude*Math.PI/180,l=i.landing_point_2.latitude*Math.PI/180,n=i.landing_point_2.longitude*Math.PI/180,s=50;for(let _=0;_<=s;_++){const C=_/s,b=Math.sin(d)*(1-C)+Math.sin(l)*C,f=Math.sqrt(1-b*b),m=c+(n-c)*C,S=100*f*Math.cos(m),w=100*b,y=100*f*Math.sin(m);o.push(new q(S,w,y))}const u=new I().setFromPoints(o),p=new j({color:new H(i.color||65484),linewidth:2,transparent:!0,opacity:.8}),h=new V(u,p);this.cableGroup.add(h)}),this.globe.scene().add(this.cableGroup),this.originalData.cables=e,this.stats.cables=e.length}applyFilters(t,a){const{accuracy:e="all",region:i="all",capacity:o="all",majorOnly:r=!1}=a;let d=r?t.filter(c=>c.capacity_tbps>100||c.name.includes("MAREA")||c.name.includes("Grace")||c.name.includes("2Africa")):this.selectImportantCables(t);return e==="live"?d=d.filter(c=>c.data_accuracy==="live"):e==="estimated"&&(d=d.filter(c=>c.data_accuracy!=="live")),d}renderCablesAsLines(t,a={}){const{accuracy:e="all",region:i="all",capacity:o="all",majorOnly:r=!1}=a;let d=r?t.filter(l=>l.capacity_tbps>100||l.name.includes("MAREA")||l.name.includes("Grace")||l.name.includes("2Africa")):this.selectImportantCables(t);e==="live"?d=d.filter(l=>l.data_accuracy==="live"):e==="estimated"&&(d=d.filter(l=>l.data_accuracy!=="live")),i!=="all"&&(d=d.filter(l=>{const n=l.landing_point_1.latitude,s=l.landing_point_1.longitude,u=l.landing_point_2.latitude,p=l.landing_point_2.longitude;switch(i){case"transatlantic":return(s<-40&&p>-20||p<-40&&s>-20)&&Math.abs(n-u)<30;case"transpacific":return Math.abs(s-p)>100&&(s>100||s<-100)&&(p>100||p<-100);case"europe-asia":return(s<40&&p>40||p<40&&s>40)&&n>20&&u>0;case"americas-internal":return s<-30&&p<-30;case"europe-internal":return s>-10&&s<40&&p>-10&&p<40&&n>35&&u>35;case"asia-internal":return s>60&&p>60;case"africa-connected":return n<35&&n>-35&&s>-20&&s<55||u<35&&u>-35&&p>-20&&p<55;default:return!0}})),o!=="all"&&(d=d.filter(l=>{const n=l.capacity_tbps||50;switch(o){case"high":return n>150;case"medium":return n>=50&&n<=150;case"low":return n<50;default:return!0}}));const c=d.map(l=>{const n=[],s=l.landing_point_1.latitude,u=l.landing_point_1.longitude,p=l.landing_point_2.latitude,h=l.landing_point_2.longitude,_=50;for(let f=0;f<=_;f++){const m=f/_,S=s+(p-s)*m,w=u+(h-u)*m,y=Math.sin(m*Math.PI)*.02;n.push([S,w,y])}const C=l.capacity_tbps?l.capacity_tbps/200:.5,b=.3+C*.4;return{coords:n,color:this.getCableColor(l,b),stroke:Math.max(.5,C*2),label:l.name,cable:l}});this.globe.pathsData(c).pathPoints("coords").pathColor("color").pathStroke("stroke").pathDashLength(0).pathDashGap(0).pathDashAnimateTime(0).pathLabel(l=>this.createMinimalTooltip(l.cable)).pathTransitionDuration(1500),this.stats.cables=c.length,this.originalData.cables=c}setupInfoTooltips(){var d,c,l;const t=(n,s)=>{const u={width:window.innerWidth,height:window.innerHeight},p=Math.min(420,u.width-40),h=u.height-40,_=(u.width-p)/2,C=20;n.style.width=`${p}px`,n.style.left=`${_}px`,n.style.top=`${C}px`,n.style.maxHeight=`${h}px`,n.style.transform="none";const b=document.getElementById("tooltip-overlay");if(b)b.classList.remove("hidden");else{const f=document.createElement("div");f.id="tooltip-overlay",f.className="tooltip-overlay",f.addEventListener("click",()=>{document.querySelectorAll(".info-tooltip").forEach(m=>{m.classList.remove("visible")}),f.classList.add("hidden")}),document.body.appendChild(f)}u.width<768&&(n.style.left="10px",n.style.width=`${u.width-20}px`,n.style.top="10px",n.style.maxHeight=`${u.height-20}px`)},a=(n,s)=>{const u=document.getElementById(n),p=document.getElementById("tooltip-overlay");u&&(document.querySelectorAll(".info-tooltip").forEach(_=>{_.id!==n&&_.classList.remove("visible")}),u.classList.contains("visible")?(u.classList.remove("visible"),p&&p.classList.add("hidden")):(u.classList.add("visible"),t(u)))},e=document.getElementById("major-cables-info");e==null||e.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),a("major-cables-tooltip")});const i=document.getElementById("capacity-info");i==null||i.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),a("capacity-tooltip")});const o=document.getElementById("tiers-info");o==null||o.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),a("tiers-tooltip")});const r=n=>{const s=document.getElementById(n),u=document.getElementById("tooltip-overlay");s&&(s.classList.remove("visible"),u&&u.classList.add("hidden"))};(d=document.getElementById("close-major-tooltip"))==null||d.addEventListener("click",()=>{r("major-cables-tooltip")}),(c=document.getElementById("close-capacity-tooltip"))==null||c.addEventListener("click",()=>{r("capacity-tooltip")}),(l=document.getElementById("close-tiers-tooltip"))==null||l.addEventListener("click",()=>{r("tiers-tooltip")}),document.addEventListener("click",n=>{if(!n.target.closest(".info-icon")&&!n.target.closest(".info-tooltip")){const s=document.getElementById("tooltip-overlay");document.querySelectorAll(".info-tooltip").forEach(u=>{u.classList.remove("visible")}),s&&s.classList.add("hidden")}}),window.addEventListener("resize",()=>{document.querySelectorAll(".info-tooltip.visible").forEach(n=>{let s=null;n.id==="major-cables-tooltip"?s=document.getElementById("major-cables-info"):n.id==="capacity-tooltip"?s=document.getElementById("capacity-info"):n.id==="tiers-tooltip"&&(s=document.getElementById("tiers-info")),s&&t(n)})})}setupDataTables(){var w;const t=document.getElementById("cable-table-toggle"),a=document.getElementById("list-view-modal"),e=document.getElementById("list-view-close"),i=document.getElementById("export-csv"),o=document.getElementById("cable-tbody"),r=document.getElementById("filtered-count"),d=document.getElementById("total-count"),c=()=>{var x,A,B,T;const y={accuracy:((x=document.getElementById("cable-filter"))==null?void 0:x.value)||"all",region:((A=document.getElementById("region-filter"))==null?void 0:A.value)||"all",capacity:((B=document.getElementById("capacity-filter"))==null?void 0:B.value)||"all",majorOnly:((T=document.getElementById("show-major-only"))==null?void 0:T.checked)||!1};let g=[...this.allCables];return y.majorOnly&&(g=g.filter(v=>v.capacity_tbps>100||v.name.includes("MAREA")||v.name.includes("Grace")||v.name.includes("2Africa"))),y.accuracy==="live"?g=g.filter(v=>v.data_accuracy==="live"):y.accuracy==="estimated"&&(g=g.filter(v=>v.data_accuracy!=="live")),y.region!=="all"&&(g=g.filter(v=>{const E=v.landing_point_1.latitude,L=v.landing_point_1.longitude,D=v.landing_point_2.latitude,M=v.landing_point_2.longitude;switch(y.region){case"transatlantic":return(L<-40&&M>-20||M<-40&&L>-20)&&Math.abs(E-D)<30;case"transpacific":return Math.abs(L-M)>100&&(L>100||L<-100)&&(M>100||M<-100);case"europe-asia":return(L<40&&M>40||M<40&&L>40)&&E>20&&D>0;case"americas-internal":return L<-30&&M<-30;case"europe-internal":return L>-10&&L<40&&M>-10&&M<40&&E>35&&D>35;case"asia-internal":return L>60&&M>60;case"africa-connected":return E<35&&E>-35&&L>-20&&L<55||D<35&&D>-35&&M>-20&&M<55;default:return!0}})),y.capacity!=="all"&&(g=g.filter(v=>{const E=v.capacity_tbps||50;switch(y.capacity){case"high":return E>150;case"medium":return E>=50&&E<=150;case"low":return E<50;default:return!0}})),g},l=()=>{const y=c();r&&(r.textContent=y.length),d&&(d.textContent=this.allCables.length),o&&(o.innerHTML="",y.forEach(g=>{const x=this.calculateDistance(g.landing_point_1.latitude,g.landing_point_1.longitude,g.landing_point_2.latitude,g.landing_point_2.longitude),A=document.createElement("tr");A.innerHTML=`
            <td>${g.name||"Unknown Cable"}</td>
            <td>${g.capacity_tbps?g.capacity_tbps.toFixed(1):"N/A"}</td>
            <td>${Math.round(x)}</td>
            <td>${g.landing_point_1.location||`${g.landing_point_1.latitude.toFixed(1)}°, ${g.landing_point_1.longitude.toFixed(1)}°`}</td>
            <td>${g.landing_point_2.location||`${g.landing_point_2.latitude.toFixed(1)}°, ${g.landing_point_2.longitude.toFixed(1)}°`}</td>
            <td class="status-${g.status||"active"}">${(g.status||"Active").toUpperCase()}</td>
            <td class="accuracy-${g.data_accuracy==="live"?"live":"estimated"}">${g.data_accuracy==="live"?"Live":"Estimated"}</td>
          `,o.appendChild(A)}))};t==null||t.addEventListener("click",()=>{a&&(a.classList.remove("hidden"),l())}),e==null||e.addEventListener("click",()=>{a&&a.classList.add("hidden")}),a==null||a.addEventListener("click",y=>{y.target===a&&a.classList.add("hidden")}),i==null||i.addEventListener("click",()=>{const y=c(),g=this.exportToCSV(y);this.downloadCSV(g,"submarine_cables_export.csv")}),document.querySelectorAll("#cable-table th.sortable").forEach(y=>{y.addEventListener("click",()=>{y.dataset.sort;const g=Array.from(o.querySelectorAll("tr"));g.sort((x,A)=>{const B=x.children[y.cellIndex].textContent,T=A.children[y.cellIndex].textContent;return B.localeCompare(T,void 0,{numeric:!0})}),o.innerHTML="",g.forEach(x=>o.appendChild(x))})});const s=document.getElementById("datacenter-table-toggle"),u=document.getElementById("datacenter-list-modal"),p=document.getElementById("datacenter-list-close"),h=document.getElementById("datacenter-export-csv"),_=document.getElementById("datacenter-tbody"),C=document.getElementById("datacenter-filtered-count"),b=document.getElementById("datacenter-total-count"),f=()=>{var x;if(!_||!this.allDatacenters)return;_.innerHTML="";const y=((x=document.getElementById("datacenter-filter"))==null?void 0:x.value)||"all";let g=[...this.allDatacenters];if(y!=="all"){const A=parseInt(y.replace("tier",""));g=g.filter(B=>B.tier===A)}C&&(C.textContent=g.length),b&&(b.textContent=this.allDatacenters.length),g.forEach(A=>{var T,v;const B=document.createElement("tr");B.innerHTML=`
          <td>${A.city||"Unknown"}</td>
          <td>${A.country||"Unknown"}</td>
          <td><span class="tier-badge tier${A.tier}">Tier ${A.tier}</span></td>
          <td>${A.provider||"N/A"}</td>
          <td>${(T=A.latitude)==null?void 0:T.toFixed(4)}, ${(v=A.longitude)==null?void 0:v.toFixed(4)}</td>
          <td>${A.name||"DC"}</td>
          <td><span class="status-active">Active</span></td>
        `,_.appendChild(B)})};s==null||s.addEventListener("click",()=>{u&&(u.classList.remove("hidden"),f())}),p==null||p.addEventListener("click",()=>{u&&u.classList.add("hidden")}),(w=document.getElementById("datacenter-filter"))==null||w.addEventListener("change",()=>{u&&!u.classList.contains("hidden")&&f()}),h==null||h.addEventListener("click",()=>{var T;const y=((T=document.getElementById("datacenter-filter"))==null?void 0:T.value)||"all";let g=[...this.allDatacenters];if(y!=="all"){const v=parseInt(y.replace("tier",""));g=g.filter(E=>E.tier===v)}const x=["City","Country","Tier","Provider","Latitude","Longitude","Name"],A=g.map(v=>[v.city||"Unknown",v.country||"Unknown",`Tier ${v.tier}`,v.provider||"N/A",v.latitude,v.longitude,v.name||"DC"]);let B=x.join(",")+`
`;A.forEach(v=>{B+=v.map(E=>`"${E}"`).join(",")+`
`}),this.downloadCSV(B,"data_centers.csv")});const m=document.getElementById("panel-toggle"),S=document.querySelector(".control-panel");m==null||m.addEventListener("click",()=>{S&&(S.classList.toggle("collapsed"),S.classList.contains("collapsed")?m.title="Show Panel":m.title="Hide Panel")})}exportToCSV(t){const a=["Name","Capacity (Tbps)","Distance (km)","From","To","Status","Data Accuracy"],e=t.map(o=>{const r=this.calculateDistance(o.landing_point_1.latitude,o.landing_point_1.longitude,o.landing_point_2.latitude,o.landing_point_2.longitude);return[o.name||"Unknown",o.capacity_tbps||"N/A",Math.round(r),o.landing_point_1.location||`${o.landing_point_1.latitude.toFixed(1)}°, ${o.landing_point_1.longitude.toFixed(1)}°`,o.landing_point_2.location||`${o.landing_point_2.latitude.toFixed(1)}°, ${o.landing_point_2.longitude.toFixed(1)}°`,o.status||"Active",o.data_accuracy==="live"?"Live":"Estimated"]});return[a,...e].map(o=>o.map(r=>`"${String(r).replace(/"/g,'""')}"`).join(",")).join(`
`)}downloadCSV(t,a){const e=new Blob([t],{type:"text/csv;charset=utf-8;"}),i=document.createElement("a"),o=URL.createObjectURL(e);i.setAttribute("href",o),i.setAttribute("download",a),i.style.visibility="hidden",document.body.appendChild(i),i.click(),document.body.removeChild(i)}setupMinimalControls(){var l,n,s,u,p,h,_,C,b,f;this.setupDataTables(),this.setupInfoTooltips();const t=document.getElementById("rotation-toggle"),a=t==null?void 0:t.querySelector(".play-icon"),e=t==null?void 0:t.querySelector(".pause-icon");t==null||t.addEventListener("click",()=>{const m=this.globe.controls();m.autoRotate=!m.autoRotate,m.update(),m.autoRotate?(a.style.display="none",e.style.display="block"):(a.style.display="block",e.style.display="none")});const i=()=>{var m,S,w,y;return{accuracy:((m=document.getElementById("cable-filter"))==null?void 0:m.value)||"all",region:((S=document.getElementById("region-filter"))==null?void 0:S.value)||"all",capacity:((w=document.getElementById("capacity-filter"))==null?void 0:w.value)||"all",majorOnly:((y=document.getElementById("show-major-only"))==null?void 0:y.checked)||!1}},o=()=>{const m=i();console.log("Applying filters:",m),this.renderCleanCables(this.allCables,m);const S=document.getElementById("cable-count");if(S){const w=this.originalData.cables.length,y=this.allCables.length;S.textContent=`${w}/${y}`}};(l=document.getElementById("cable-filter"))==null||l.addEventListener("change",o),(n=document.getElementById("region-filter"))==null||n.addEventListener("change",o),(s=document.getElementById("capacity-filter"))==null||s.addEventListener("change",o),(u=document.getElementById("show-major-only"))==null||u.addEventListener("change",o),(p=document.getElementById("toggle-cables"))==null||p.addEventListener("change",m=>{if(m.target.checked){console.log("Toggling cables ON, total cables:",this.allCables.length);const S=i();this.renderCleanCables(this.allCables,S)}else{console.log("Toggling cables OFF"),this.globe.arcsData([]);const S=document.getElementById("cable-count");S&&(S.textContent=`0/${this.allCables.length}`)}});const r=()=>{var S,w;if((S=document.getElementById("toggle-datacenters"))==null?void 0:S.checked){const y=((w=document.getElementById("datacenter-filter"))==null?void 0:w.value)||"all";this.renderMinimalDataCenters(this.allDatacenters,y)}else this.globe.pointsData([])};(h=document.getElementById("toggle-datacenters"))==null||h.addEventListener("change",r),(_=document.getElementById("datacenter-filter"))==null||_.addEventListener("change",r),(C=document.getElementById("toggle-atmosphere"))==null||C.addEventListener("change",m=>{this.globe.showAtmosphere(m.target.checked)});const d=document.getElementById("cable-glow");(b=d==null?void 0:d.parentElement)!=null&&b.parentElement&&(d.parentElement.parentElement.style.display="none");const c=document.getElementById("flow-speed");(f=c==null?void 0:c.parentElement)!=null&&f.parentElement&&(c.parentElement.parentElement.style.display="none"),document.addEventListener("keydown",m=>{(m.key==="r"||m.key==="R")&&this.globe.pointOfView({lat:20,lng:-40,altitude:2.8},1e3)}),window.addEventListener("resize",()=>{this.globe.width(window.innerWidth),this.globe.height(window.innerHeight)})}updateLoadingStatus(t){const a=document.querySelector(".loading-status");a&&(a.textContent=t)}hideLoadingScreen(){const t=document.getElementById("loading-screen");t&&setTimeout(()=>{t.style.opacity="0",t.style.transition="opacity 1s ease",setTimeout(()=>{t.style.display="none"},1e3)},500)}updateStats(){document.getElementById("cable-count").textContent=this.stats.cables,document.getElementById("datacenter-count").textContent=this.stats.datacenters}}document.addEventListener("DOMContentLoaded",()=>{new J});
//# sourceMappingURL=index-Ckbp9Ic7.js.map

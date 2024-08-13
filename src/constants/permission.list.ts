export type PermissionList = Array<{ keyword: string, permission: string, label: string , router:string}>

const permission_list: PermissionList = [
  { permission: "admin",                         keyword: "all",  label: "admin",                     router:"/"},
  { permission: "chicken population managemant", keyword: "chpm", label: "tovuq soni boshqaruvi",     router:"/"},
  { permission: "drug report",                   keyword: "dr",   label: "dori hisoboti",             router:"/"},
  { permission: "feed report",                   keyword: "fr",   label: "yem hisoboti",              router:"/"},
  { permission: "chick status report",           keyword: "chsr", label: "jo'ja holati hisoboti",     router:"/"},
  { permission: "electrical equipment report",   keyword: "eer",  label: "electr uskunalar hisoboti", router:"/"},
  { permission: "equipment report",              keyword: "er",   label: "uskunalar hisoboti",        router:"/"},
  { permission: "kitchen report",                keyword: "kr",   label: "oshxona hisoboti",          router:"/"},
  { permission: "additional reports",            keyword: "ar",   label: "qoshimcha hisobotlar",      router:"/"},
]


export default permission_list
interface ObjSearch {
  title?: RegExp
}

export const searchHelpers = (query: Record<string, any>): ObjSearch => {
  let find: ObjSearch = {} // Không tìm kiếm gì cả
  if(query.keyword) {
    find.title = new RegExp(query.keyword, "i")
  }

  return find
}
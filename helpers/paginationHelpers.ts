interface ObjPagination {
  currentPage: number,
  limitItem: number,
  totalPage?: number,
  skip: number
}

export const paginationHelpers = (query: Record<string, any>, objPagination: ObjPagination, countPage: number): ObjPagination => {
  objPagination.totalPage = Math.ceil(countPage / objPagination.limitItem)
  if(query.page) {
    objPagination.currentPage = parseInt(query.page)
    if(isNaN(objPagination.currentPage)) {
      objPagination.currentPage = 1;
    }
    else if(objPagination.currentPage <= 0) {
      objPagination.currentPage = 1
    }
    else if(objPagination.currentPage > objPagination.totalPage) {
      objPagination.currentPage = objPagination.totalPage;
    }
  } else {
    objPagination.currentPage = 1;
  }

  objPagination.skip = ((objPagination.currentPage - 1) * objPagination.limitItem)

  return objPagination;
}
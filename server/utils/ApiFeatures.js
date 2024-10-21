class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query
        this.queryStr = queryStr
    }
    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: "i",
            },
        } : {}
        //console.log(keyword)
        this.query = this.query.find({ ...keyword })
        return this
    }
    filter() {
        const duplicate = { ...this.queryStr }

        // for category
        const fields = ["keyword", "page", "limit"]

        fields.forEach((key) => delete duplicate[key])

        // for price
        let queryStr = JSON.stringify(duplicate)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`)

        this.query = this.query.find(JSON.parse(queryStr))
        return this
    }
    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.page) || 1
        const skip = resultPerPage * (currentPage - 1)
        this.query = this.query.limit(resultPerPage).skip(skip)

        return this
    }
}

export { ApiFeatures }
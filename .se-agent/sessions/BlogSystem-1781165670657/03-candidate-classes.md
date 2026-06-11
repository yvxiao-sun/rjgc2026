# 候选类识别

**步骤**: 3/6
**状态**: completed
**自检**: 未检查

---

{
  "candidateClasses": [
    {
      "className": "User",
      "description": "博客系统的用户实体，代表所有注册用户，包含普通用户、作者和管理员角色",
      "coreAttributes": [
        "用户ID (userId)",
        "用户名 (username)",
        "邮箱 (email)",
        "密码 (password)",
        "昵称 (nickname)",
        "头像 (avatar)",
        "个人简介 (bio)",
        "注册时间 (createdAt)",
        "角色 (role): 普通用户/作者/管理员"
      ],
      "responsibilities": [
        "管理个人账号信息",
        "作为作者发布和管理文章",
        "作为普通用户发表和删除评论",
        "作为管理员管理所有内容和用户"
      ]
    },
    {
      "className": "Article",
      "description": "博客文章实体，包含文章的所有内容和元数据，由作者创建和管理",
      "coreAttributes": [
        "文章ID (articleId)",
        "标题 (title)",
        "正文 (content)",
        "摘要 (summary)",
        "分类 (category)",
        "发布时间 (publishedAt)",
        "更新时间 (updatedAt)",
        "浏览量 (viewCount)",
        "作者ID (authorId)"
      ],
      "responsibilities": [
        "存储和展示博客文章内容",
        "关联所属分类和标签",
        "记录文章浏览数据",
        "支持按分类、标签、时间筛选和搜索"
      ]
    },
    {
      "className": "Comment",
      "description": "文章评论实体，支持嵌套回复结构，由登录用户创建",
      "coreAttributes": [
        "评论ID (commentId)",
        "内容 (content)",
        "评论时间 (createdAt)",
        "评论人ID (commenterId)",
        "所属文章ID (articleId)",
        "父评论ID (parentCommentId): 用于嵌套回复"
      ],
      "responsibilities": [
        "存储用户对文章的评论内容",
        "支持评论的嵌套回复结构",
        "关联评论人和被评论的文章",
        "允许用户删除自己的评论"
      ]
    },
    {
      "className": "Category",
      "description": "文章分类实体，用于对文章进行归类管理",
      "coreAttributes": [
        "分类ID (categoryId)",
        "分类名称 (name): 如技术、生活、随笔",
        "分类描述 (description)"
      ],
      "responsibilities": [
        "定义文章的分类体系",
        "关联到多篇文章",
        "支持按分类筛选文章列表"
      ]
    },
    {
      "className": "Tag",
      "description": "文章标签实体，支持多标签标注，用于精细化内容组织",
      "coreAttributes": [
        "标签ID (tagId)",
        "标签名称 (name)",
        "标签颜色 (color): 可选，用于前端展示"
      ],
      "responsibilities": [
        "定义文章的标签体系",
        "与文章建立多对多关系",
        "支持按标签筛选和搜索文章"
      ]
    },
    {
      "className": "ArticleTag",
      "description": "文章与标签的关联实体，用于实现多对多关系",
      "coreAttributes": [
        "关联ID (id)",
        "文章ID (articleId)",
        "标签ID (tagId)"
      ],
      "responsibilities": [
        "维护文章和标签之间的多对多关联",
        "支持文章的多标签标注"
      ]
    }
  ]
}
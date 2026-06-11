# 候选类识别

**步骤**: 3/6
**状态**: completed
**自检**: 未检查

---

{
  "candidateClasses": [
    {
      "className": "User",
      "description": "代表博客系统的用户，可以是普通用户、作者或管理员",
      "coreAttributes": [
        "用户ID (userId)",
        "用户名 (username)",
        "邮箱 (email)",
        "密码 (password)",
        "昵称 (nickname)",
        "头像 (avatar)",
        "简介 (bio)",
        "注册时间 (registerTime)",
        "角色 (role): 普通用户/作者/管理员"
      ],
      "responsibilities": [
        "管理个人账户信息（注册、登录、修改资料）",
        "作为作者发布和管理文章",
        "作为读者浏览文章和发表评论",
        "作为管理员管理所有内容和用户"
      ]
    },
    {
      "className": "Article",
      "description": "代表博客中的一篇文章，由作者创建和发布",
      "coreAttributes": [
        "文章ID (articleId)",
        "标题 (title)",
        "正文 (content)",
        "摘要 (summary)",
        "分类 (category)",
        "标签列表 (tags)",
        "发布时间 (publishTime)",
        "更新时间 (updateTime)",
        "浏览量 (viewCount)",
        "作者ID (authorId)"
      ],
      "responsibilities": [
        "存储文章的核心内容和元数据",
        "支持按分类、标签、时间进行筛选",
        "支持标题和正文的关键词搜索",
        "关联作者和评论"
      ]
    },
    {
      "className": "Comment",
      "description": "代表用户对文章的评论或回复",
      "coreAttributes": [
        "评论ID (commentId)",
        "内容 (content)",
        "评论时间 (commentTime)",
        "评论人ID (userId)",
        "文章ID (articleId)",
        "父评论ID (parentCommentId)"
      ],
      "responsibilities": [
        "存储评论内容及时间信息",
        "支持嵌套回复（通过父评论ID实现）",
        "关联评论人和所属文章",
        "支持用户删除自己的评论"
      ]
    },
    {
      "className": "Category",
      "description": "代表文章的分类标签，用于组织文章",
      "coreAttributes": [
        "分类ID (categoryId)",
        "分类名称 (name)",
        "分类描述 (description)"
      ],
      "responsibilities": [
        "对文章进行分类管理",
        "支持按分类筛选文章列表"
      ]
    },
    {
      "className": "Tag",
      "description": "代表文章的标签，用于更细粒度的内容标记",
      "coreAttributes": [
        "标签ID (tagId)",
        "标签名称 (name)"
      ],
      "responsibilities": [
        "对文章进行多标签标记",
        "支持按标签筛选文章列表"
      ]
    },
    {
      "className": "ArticleTag",
      "description": "文章和标签的多对多关联关系",
      "coreAttributes": [
        "关联ID (id)",
        "文章ID (articleId)",
        "标签ID (tagId)"
      ],
      "responsibilities": [
        "维护文章和标签之间的多对多关系",
        "支持文章的多标签查询"
      ]
    }
  ],
  "description": "基于需求文档识别出6个核心候选类：User（用户）是系统的核心参与者，具有多角色能力；Article（文章）是博客的主要内容实体；Comment（评论）支持嵌套回复功能；Category（分类）和Tag（标签）用于文章的组织和筛选；ArticleTag作为关联实体处理文章和标签的多对多关系。这些类共同构成了博客系统的领域模型基础。"
}
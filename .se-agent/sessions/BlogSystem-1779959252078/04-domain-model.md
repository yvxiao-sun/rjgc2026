# 领域模型

**步骤**: 4/6
**状态**: completed
**自检**: 未检查

---

**描述**: 领域模型包含8个核心类，通过继承、关联、聚合和组合关系构建完整的博客系统领域模型。User作为基类派生出Author和Admin，Article与Comment、Category、Tag之间存在多种关联关系，同时通过AuditLog实现操作审计。多重性约束确保了数据完整性和业务规则的实现。

## Mermaid 类图

```mermaid
classDiagram
    class User {
        +userId: Long
        +username: String
        +email: String
        +password: String
        +nickname: String
        +avatar: String
        +bio: String
        +registerTime: DateTime
        +role: UserRole
        +register()
        +login()
        +updateProfile()
        +deleteComment()
    }

    class Author {
        +articleCount: int
        +totalViews: long
        +writeArticle()
        +editArticle()
        +deleteArticle()
        +manageArticles()
    }

    class Admin {
        +manageAllArticles()
        +manageAllComments()
        +manageUsers()
        +auditContent()
    }

    class Article {
        +articleId: Long
        +title: String
        +content: String
        +summary: String
        +publishTime: DateTime
        +updateTime: DateTime
        +viewCount: long
        +status: ArticleStatus
        +publish()
        +edit()
        +delete()
        +incrementViews()
    }

    class Comment {
        +commentId: Long
        +content: String
        +commentTime: DateTime
        +status: CommentStatus
        +addReply()
        +delete()
        +getReplies()
    }

    class Category {
        +categoryId: Long
        +name: String
        +description: String
        +createTime: DateTime
        +addArticle()
        +removeArticle()
        +getArticles()
    }

    class Tag {
        +tagId: Long
        +name: String
        +createTime: DateTime
        +getArticles()
    }

    class ArticleTag {
        +articleId: Long
        +tagId: Long
    }

    class Session {
        +sessionId: String
        +userId: Long
        +loginTime: DateTime
        +expireTime: DateTime
        +token: String
        +isValid()
        +refresh()
        +invalidate()
    }

    class AuditLog {
        +logId: Long
        +operatorId: Long
        +actionType: ActionType
        +targetType: TargetType
        +targetId: Long
        +operationTime: DateTime
        +details: String
        +record()
        +query()
    }

    %% 继承关系
    User <|-- Author
    User <|-- Admin

    %% 关联关系
    User "1" --> "*" Article : writes
    User "1" --> "*" Comment : creates
    Article "1" --> "*" Comment : has
    Comment "*" --> "0..1" Comment : replies to
    Article "*" --> "1" Category : belongs to
    Article "*" --> "*" Tag : tagged with
    ArticleTag "*" --> "1" Article : references
    ArticleTag "*" --> "1" Tag : references
    User "1" --> "*" Session : has
    User "1" --> "*" AuditLog : generates
    Article "1" --> "*" AuditLog : generates
    Comment "1" --> "*" AuditLog : generates

    %% 聚合关系
    Category "1" o--> "*" Article : contains

    %% 组合关系
    Article "1" *--> "*" Comment : contains
    User "1" *--> "*" Session : manages
```

## 类关系

- **undefined** 泛化（继承） **undefined**
- **undefined** 关联 **undefined**
- **undefined** 聚合 **undefined**
- **undefined** 组合 **undefined**


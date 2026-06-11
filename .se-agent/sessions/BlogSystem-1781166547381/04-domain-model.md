# 领域模型

**步骤**: 4/6
**状态**: completed
**自检**: 未检查

---

## Mermaid 类图

```mermaid
classDiagram
    class User {
        +String userId
        +String username
        +String email
        +String password
        +String nickname
        +String avatar
        +String bio
        +DateTime registerTime
        +String role
        +register()
        +login()
        +updateProfile()
    }

    class Author {
        +publishArticle()
        +editArticle()
        +deleteArticle()
    }

    class Admin {
        +manageAllArticles()
        +manageAllComments()
        +manageUsers()
    }

    class Article {
        +String articleId
        +String title
        +String content
        +String summary
        +DateTime publishTime
        +DateTime updateTime
        +int viewCount
        +publish()
        +edit()
        +delete()
    }

    class Comment {
        +String commentId
        +String content
        +DateTime commentTime
        +addComment()
        +deleteComment()
    }

    class Category {
        +String categoryId
        +String name
        +String description
    }

    class Tag {
        +String tagId
        +String name
    }

    class ArticleTag {
        +String id
        +String articleId
        +String tagId
    }

    User <|-- Author : extends
    User <|-- Admin : extends
    User "1" --> "*" Article : writes
    User "1" --> "*" Comment : creates
    Article "1" --> "*" Comment : contains
    Article "*" --> "1" Category : belongs to
    Article "*" --> "*" Tag : tagged with
    ArticleTag "*" --> "1" Article : references
    ArticleTag "*" --> "1" Tag : references
    Comment "*" --> "0..1" Comment : replies to
    Article "1" --> "1" User : authored by
```

## 类关系

- **undefined** 泛化（继承） **undefined**
- **undefined** 关联 **undefined**
- **undefined** 聚合/组合 **undefined**
- **undefined** 多重性约束 **undefined**


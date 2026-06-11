# 领域模型

**步骤**: 4/6
**状态**: completed
**自检**: 未检查

---

## Mermaid 类图

```mermaid
classDiagram
    class User {
        +int userId
        +string username
        +string email
        +string password
        +string nickname
        +string avatar
        +string bio
        +datetime createdAt
        +string role
        +register()
        +login()
        +updateProfile()
    }

    class Author {
        +int articleCount
        +publishArticle()
        +editArticle()
        +deleteArticle()
    }

    class Admin {
        +manageUsers()
        +manageArticles()
        +manageComments()
    }

    class Article {
        +int articleId
        +string title
        +string content
        +string summary
        +datetime publishedAt
        +datetime updatedAt
        +int viewCount
        +publish()
        +edit()
        +delete()
    }

    class Comment {
        +int commentId
        +string content
        +datetime createdAt
        +addComment()
        +deleteComment()
    }

    class Category {
        +int categoryId
        +string name
        +string description
        +getArticles()
    }

    class Tag {
        +int tagId
        +string name
        +string color
        +getArticles()
    }

    class ArticleTag {
        +int id
        +int articleId
        +int tagId
    }

    User <|-- Author : extends
    User <|-- Admin : extends
    User "1" --> "*" Article : writes
    User "1" --> "*" Comment : creates
    Article "1" --> "*" Comment : has
    Article "*" --> "1" Category : belongs to
    Article "*" --> "*" Tag : tagged with
    Article "1" --> "*" ArticleTag : has
    Tag "1" --> "*" ArticleTag : has
    Comment "*" --> "0..1" Comment : replies to
    Article "1" --> "1" Category : categorized by```

## 类关系

- **undefined** 泛化（继承） **undefined**
- **undefined** 关联关系 **undefined**
- **undefined** 聚合/组合关系 **undefined**
- **undefined** 多重性约束总结 **undefined**


# 领域模型

**步骤**: 4/6
**状态**: completed
**自检**: 未检查

---

**描述**: 基于博客系统需求，构建了包含8个类的领域模型。通过泛化关系实现角色继承（User→Author/Admin），通过关联关系定义实体间的业务联系（1对多、多对1、自关联），通过聚合/组合关系处理文章与标签的多对多映射。模型完整覆盖了用户管理、文章管理、评论互动、分类标签等核心业务领域。

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
        +datetime registerTime
        +string role
        +register()
        +login()
        +updateProfile()
    }

    class Author {
        +int articleCount
        +writeArticle()
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
        +datetime publishTime
        +datetime updateTime
        +int viewCount
        +publish()
        +edit()
        +delete()
    }

    class Comment {
        +int commentId
        +string content
        +datetime commentTime
        +create()
        +delete()
    }

    class Category {
        +int categoryId
        +string name
        +string description
        +datetime createTime
    }

    class Tag {
        +int tagId
        +string name
        +datetime createTime
    }

    class ArticleTag {
        +int articleId
        +int tagId
    }

    class Session {
        +string sessionId
        +int userId
        +datetime loginTime
        +datetime expireTime
        +string token
        +create()
        +validate()
        +destroy()
    }

    User <|-- Author : extends
    User <|-- Admin : extends
    User "1" --> "*" Article : writes
    User "1" --> "*" Comment : creates
    User "1" --> "*" Session : has
    Article "1" --> "*" Comment : contains
    Article "*" --> "1" Category : belongs to
    Article "1" --> "*" ArticleTag : has
    Tag "1" --> "*" ArticleTag : has
    Comment "*" --> "0..1" Comment : replies to
    Article "*" --> "1" User : authored by```

## 类关系

- **undefined** 泛化关系（继承） **undefined**
- **undefined** 关联关系 **undefined**
- **undefined** 聚合/组合关系 **undefined**


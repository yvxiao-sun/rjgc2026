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
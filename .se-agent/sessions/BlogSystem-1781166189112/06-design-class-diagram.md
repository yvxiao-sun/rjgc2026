# 设计类图

**步骤**: 6/6
**状态**: completed
**自检**: 未检查

---

**设计摘要**: 基于领域模型细化的设计类图，包含11个核心类。User类作为基类提供用户基础属性和认证方法，Author和Admin继承User并扩展特有功能。Article、Comment、Category、Tag构成内容管理核心，ArticleTag处理多对多关系。Session管理用户会话，SearchService和AuthService作为服务类提供搜索和认证功能。所有类都补充了完整的属性和方法，并明确了可见性（public/private/protected），类之间的关系也进行了完善和补充。

## Mermaid 设计类图

```mermaid
classDiagram
    class User {
        -int userId
        -string username
        -string email
        -string passwordHash
        -string nickname
        -string avatar
        -string bio
        -DateTime registerTime
        -string role
        -bool isActive
        +User(username, email, password)
        +bool login(usernameOrEmail, password)
        +void updateProfile(nickname, avatar, bio)
        +bool changePassword(oldPassword, newPassword)
        +void logout()
        #string hashPassword(password)
        #bool verifyPassword(password, hash)
    }

    class Author {
        -int articleCount
        +Author(username, email, password)
        +Article createArticle(title, content, categoryId, tagIds)
        +bool editArticle(articleId, title, content, categoryId, tagIds)
        +bool deleteArticle(articleId)
        +List~Article~ getMyArticles(page, size)
    }

    class Admin {
        +Admin(username, email, password)
        +void banUser(userId)
        +void unbanUser(userId)
        +void deleteAnyArticle(articleId)
        +void deleteAnyComment(commentId)
        +List~User~ getAllUsers(page, size)
        +List~Article~ getAllArticles(page, size)
    }

    class Article {
        -int articleId
        -string title
        -string content
        -string summary
        -int categoryId
        -int authorId
        -DateTime publishTime
        -DateTime updateTime
        -int viewCount
        -string status
        +Article(title, content, authorId)
        +void publish()
        +void edit(title, content, categoryId)
        +void delete()
        +void increaseViewCount()
        +string generateSummary(content, maxLength)
        +List~Tag~ getTags()
    }

    class Comment {
        -int commentId
        -string content
        -int articleId
        -int userId
        -int parentCommentId
        -DateTime commentTime
        -string status
        +Comment(content, articleId, userId)
        +void delete()
        +void report()
        +List~Comment~ getReplies()
        +bool isReply()
    }

    class Category {
        -int categoryId
        -string name
        -string description
        -DateTime createTime
        +Category(name, description)
        +void update(name, description)
        +List~Article~ getArticles()
        +int getArticleCount()
    }

    class Tag {
        -int tagId
        -string name
        -DateTime createTime
        +Tag(name)
        +void update(name)
        +List~Article~ getArticles()
        +int getArticleCount()
    }

    class ArticleTag {
        -int articleId
        -int tagId
        +ArticleTag(articleId, tagId)
        +void remove()
    }

    class Session {
        -string sessionId
        -int userId
        -DateTime loginTime
        -DateTime expireTime
        -string token
        +Session(userId)
        +bool isValid()
        +void refresh()
        +void destroy()
    }

    class SearchService {
        -string indexDirectory
        +SearchService()
        +void indexArticle(article)
        +void removeFromIndex(articleId)
        +List~Article~ search(keyword, page, size)
        +void rebuildIndex()
    }

    class AuthService {
        -int maxLoginAttempts
        -int lockoutDuration
        +AuthService()
        +bool authenticate(usernameOrEmail, password)
        +void sendVerificationEmail(email)
        +bool verifyEmail(token)
        +void resetPassword(email)
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
    Article "*" --> "1" User : authored by
    SearchService --> Article : indexes
    AuthService --> User : authenticates```


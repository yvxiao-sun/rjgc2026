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
        +String studentId
        +String name
        +String password
        +String role
        +String department
        +String email
        +String phone
        +login()
        +logout()
        +updateProfile()
    }
    class Student {
        +String className
        +takeExam()
        +viewScore()
        +applyReview()
    }
    class Teacher {
        +String title
        +createQuestion()
        +createExamPaper()
        +gradeSubjective()
        +monitorExam()
    }
    class Admin {
        +manageUser()
        +configureSystem()
    }
    class ExamAdmin {
        +arrangeExam()
        +publishScore()
        +assignGrading()
    }
    class Question {
        +String questionId
        +String type
        +String content
        +List~String~ options
        +String correctAnswer
        +String explanation
        +String difficulty
        +String subject
        +String knowledgePoint
        +List~String~ tags
        +String creatorId
        +DateTime createTime
        +int version
        +addVersion()
        +getHistory()
    }
    class QuestionVersion {
        +String versionId
        +String questionId
        +int versionNumber
        +String changeContent
        +String modifierId
        +DateTime modifyTime
    }
    class ExamPaper {
        +String paperId
        +String paperName
        +double totalScore
        +double passScore
        +int duration
        +String creatorId
        +DateTime createTime
        +String status
        +addQuestion()
        +removeQuestion()
        +preview()
        +publish()
    }
    class PaperQuestion {
        +String paperQuestionId
        +String paperId
        +String questionId
        +int questionOrder
        +double score
    }
    class ExamSchedule {
        +String scheduleId
        +String paperId
        +String examName
        +DateTime startTime
        +DateTime endTime
        +String scope
        +publish()
        +cancel()
    }
    class ExamRecord {
        +String recordId
        +String scheduleId
        +String studentId
        +DateTime startTime
        +DateTime submitTime
        +String status
        +int switchCount
        +double objectiveScore
        +double subjectiveScore
        +double totalScore
        +startExam()
        +submitExam()
        +saveProgress()
    }
    class AnswerRecord {
        +String answerId
        +String recordId
        +String questionId
        +String studentAnswer
        +double score
        +boolean isGraded
        +String graderId
        +DateTime gradeTime
    }
    class Score {
        +String scoreId
        +String recordId
        +double totalScore
        +double objectiveScore
        +double subjectiveScore
        +String status
        +DateTime publishTime
        +publish()
        +review()
    }
    class ReviewRequest {
        +String reviewId
        +String scoreId
        +String studentId
        +String reason
        +String status
        +String result
        +String handlerId
        +DateTime handleTime
        +submit()
        +process()
    }
    class Subject {
        +String subjectId
        +String subjectName
        +String description
    }
    class KnowledgePoint {
        +String pointId
        +String pointName
        +String subjectId
        +String description
    }
    class Tag {
        +String tagId
        +String tagName
        +String tagType
    }
    class CheatingAlert {
        +String alertId
        +String recordId
        +String alertType
        +DateTime alertTime
        +int switchCount
        +String status
        +String handlerId
        +String result
    }
    class ExamMonitor {
        +String monitorId
        +String scheduleId
        +int participatedCount
        +int notParticipatedCount
        +int abnormalCount
        +DateTime updateTime
    }
    class ScoreAnalysis {
        +String analysisId
        +String scheduleId
        +double averageScore
        +double maxScore
        +double minScore
        +double passRate
        +Map~String,int~ scoreDistribution
        +DateTime generateTime
    }

    %% 继承关系
    User <|-- Student
    User <|-- Teacher
    User <|-- Admin
    User <|-- ExamAdmin

    %% 关联关系
    Teacher "1" --> "*" Question : creates
    Teacher "1" --> "*" ExamPaper : creates
    Teacher "*" --> "*" AnswerRecord : grades
    Teacher "1" --> "*" ReviewRequest : handles
    Teacher "1" --> "*" CheatingAlert : monitors

    Student "1" --> "*" ExamRecord : has
    Student "1" --> "*" ReviewRequest : submits

    ExamAdmin "1" --> "*" ExamSchedule : arranges
    ExamAdmin "1" --> "*" Score : publishes

    Admin "1" --> "*" User : manages

    %% 聚合/组合关系
    Question "1" --> "*" QuestionVersion : has versions
    ExamPaper "1" --> "*" PaperQuestion : contains
    PaperQuestion "*" --> "1" Question : references

    ExamSchedule "1" --> "1" ExamPaper : uses
    ExamSchedule "1" --> "*" ExamRecord : generates

    ExamRecord "1" --> "*" AnswerRecord : includes
    ExamRecord "1" --> "1" Score : results in
    ExamRecord "1" --> "*" CheatingAlert : triggers

    Score "1" --> "*" ReviewRequest : has reviews

    Subject "1" --> "*" KnowledgePoint : contains
    Subject "1" --> "*" Question : categorizes
    KnowledgePoint "1" --> "*" Question : relates to

    Question "*" --> "*" Tag : tagged with

    ExamSchedule "1" --> "1" ExamMonitor : monitored by
    ExamSchedule "1" --> "1" ScoreAnalysis : analyzed by
```

## 类关系详情

### 继承（泛化）

**描述**: User是基类，Student、Teacher、Admin、ExamAdmin是子类，继承User的基本属性，并拥有各自的特定行为


### 组合（Composition）

**描述**: 强拥有关系，子类生命周期依赖于父类


### 聚合（Aggregation）

**描述**: 弱拥有关系，子类可独立存在


### 关联（Association）

**描述**: 类之间的引用关系，无生命周期依赖



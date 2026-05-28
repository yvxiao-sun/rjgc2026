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
        +String name
        +String email
        +login()
        +logout()
    }
    class Admin {
        +manageSystem()
        +createCourse()
    }
    class Student {
        +String studentId
        +String major
        +enrollCourse()
        +viewGrade()
    }
    class Teacher {
        +String teacherId
        +String department
        +createExam()
        +gradeExam()
    }
    class Course {
        +String courseId
        +String courseName
        +int credits
        +addStudent()
        +removeStudent()
    }
    class Enrollment {
        +String enrollmentId
        +Date enrollDate
        +String status
        +drop()
    }
    class Exam {
        +String examId
        +String examName
        +Date examDate
        +int totalMarks
        +publishResult()
    }
    class Grade {
        +String gradeId
        +int marksObtained
        +String letterGrade
        +calculateGrade()
    }

    User <|-- Admin : extends
    User <|-- Student : extends
    User <|-- Teacher : extends

    Student "1" --> "0..*" Enrollment : has
    Course "1" --> "0..*" Enrollment : contains
    Teacher "1" --> "0..*" Course : teaches
    Course "1" --> "0..*" Exam : has
    Exam "1" --> "0..*" Grade : includes
    Student "1" --> "0..*" Grade : receives
    Enrollment "1" --> "0..1" Grade : resultsIn
```

## 类关系

- **undefined** inheritance **undefined**
- **undefined** inheritance **undefined**
- **undefined** inheritance **undefined**
- **Student** association **Enrollment**
- **Course** association **Enrollment**
- **Teacher** association **Course**
- **Course** aggregation **Exam**
- **Exam** composition **Grade**
- **Student** association **Grade**
- **Enrollment** association **Grade**


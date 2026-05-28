# 设计类图

**步骤**: 6/6
**状态**: completed
**自检**: 未检查

---

**设计摘要**: 设计类图在领域模型的基础上进行了细化，主要改进包括：
1. 将User类设为抽象类，定义了公共属性和方法，子类继承并扩展特定角色行为
2. 补充了每个类的完整方法签名，包括业务方法和getter/setter
3. 添加了可见性修饰符（public/private/protected），private属性通过public方法访问
4. 新增了ApprovalNodeDefinition类，用于表示审批类型中定义的节点模板，与WorkflowEngine协作驱动流程
5. 完善了所有关联关系的多重性约束
6. 方法命名遵循驼峰命名规范，参数类型使用泛型（如List~File~）和JSON类型表示复杂数据结构

## Mermaid 设计类图

```mermaid
classDiagram
    class User {
        <<abstract>>
        -String userId
        -String name
        -String department
        -String position
        -String role
        +String getUserId()
        +String getName()
        +String getDepartment()
        +String getPosition()
        +String getRole()
        +void setName(String name)
        +void setDepartment(String dept)
        +void setPosition(String pos)
        +List~Notification~ getNotifications()
        +void markNotificationAsRead(String notificationId)
    }

    class Employee {
        -String employeeLevel
        +ApprovalRequest submitRequest(String typeId, JSON formData, List~File~ attachments)
        +void saveDraft(String typeId, JSON formData, List~File~ attachments)
        +void cancelRequest(String requestId)
        +void resubmitRequest(String requestId, JSON formData, List~File~ attachments)
        +List~ApprovalRequest~ getMyRequests(String statusFilter)
    }

    class DepartmentManager {
        -String managedDepartment
        +List~ApprovalRequest~ getPendingApprovals()
        +void approveRequest(String nodeId, String comment)
        +void rejectRequest(String nodeId, String reason)
        +void transferRequest(String nodeId, String targetUserId, String reason)
    }

    class FinanceStaff {
        -String financeScope
        +List~ApprovalRequest~ getPendingApprovals()
        +void approveRequest(String nodeId, String comment)
        +void rejectRequest(String nodeId, String reason)
        +void transferRequest(String nodeId, String targetUserId, String reason)
    }

    class GeneralManager {
        -Decimal approvalLimit
        +List~ApprovalRequest~ getPendingApprovals()
        +void approveRequest(String nodeId, String comment)
        +void rejectRequest(String nodeId, String reason)
        +void transferRequest(String nodeId, String targetUserId, String reason)
    }

    class SystemAdmin {
        -String adminLevel
        +ApprovalType createApprovalType(String name, String desc, JSON formTemplate, JSON workflowDef)
        +void updateApprovalType(String typeId, JSON updates)
        +void deleteApprovalType(String typeId)
        +void configureWorkflow(String typeId, JSON workflowDef)
        +List~ApprovalType~ getAllApprovalTypes()
    }

    class ApprovalType {
        -String typeId
        -String typeName
        -String description
        -JSON formTemplate
        -JSON workflowDefinition
        -DateTime createTime
        -DateTime updateTime
        +String getTypeId()
        +String getTypeName()
        +JSON getFormTemplate()
        +JSON getWorkflowDefinition()
        +void setFormTemplate(JSON template)
        +void setWorkflowDefinition(JSON workflowDef)
        +boolean validateFormData(JSON formData)
        +List~ApprovalNodeDefinition~ parseWorkflowDefinition()
    }

    class ApprovalRequest {
        -String requestId
        -String requestNumber
        -String title
        -String content
        -Decimal amount
        -Integer leaveDays
        -DateTime submitTime
        -String status
        -JSON formData
        -String applicantId
        -String approvalTypeId
        +String getRequestId()
        +String getStatus()
        +JSON getFormData()
        +void setStatus(String status)
        +void updateFormData(JSON formData)
        +boolean isEditable()
        +String generateRequestNumber()
        +List~ApprovalNode~ getApprovalNodes()
        +List~Attachment~ getAttachments()
    }

    class ApprovalNode {
        -String nodeId
        -String nodeName
        -String approvalStatus
        -String approvalComment
        -DateTime approvalTime
        -Integer nodeOrder
        -Boolean isCounterSign
        -Boolean isOrSign
        -String requestId
        -String approverId
        -String transferFromUserId
        -String transferReason
        +String getNodeId()
        +String getApprovalStatus()
        +void setApprovalStatus(String status)
        +void setApprovalComment(String comment)
        +void setApprovalTime(DateTime time)
        +void setTransferInfo(String fromUserId, String reason)
        +boolean isPending()
        +boolean isCompleted()
    }

    class Attachment {
        -String attachmentId
        -String fileName
        -String filePath
        -Long fileSize
        -String fileType
        -DateTime uploadTime
        -String requestId
        +String getFileName()
        +String getFilePath()
        +Long getFileSize()
        +String getFileType()
        +InputStream download()
        +String preview()
        +void delete()
    }

    class WorkflowEngine {
        -String engineId
        -JSON workflowContext
        +ApprovalNode createNextNode(ApprovalRequest request, ApprovalNode currentNode)
        +void evaluateConditions(ApprovalRequest request, ApprovalType type)
        +void handleCounterSign(ApprovalRequest request, ApprovalNode node)
        +void handleOrSign(ApprovalRequest request, ApprovalNode node)
        +void executePostAction(ApprovalRequest request)
        +boolean isWorkflowComplete(ApprovalRequest request)
        +void notifyApprover(ApprovalNode node)
    }

    class Notification {
        -String notificationId
        -String type
        -String content
        -Boolean isRead
        -DateTime createTime
        -String userId
        -String requestId
        +String getNotificationId()
        +String getType()
        +String getContent()
        +Boolean isRead()
        +void markAsRead()
        +DateTime getCreateTime()
    }

    class ApprovalNodeDefinition {
        -String nodeDefId
        -String nodeName
        -Integer order
        -String approverRole
        -String conditionExpression
        -Boolean isCounterSign
        -Boolean isOrSign
        -String nextNodeOnPass
        -String nextNodeOnReject
        +String getNodeDefId()
        +String getNodeName()
        +Integer getOrder()
        +String getApproverRole()
        +String getConditionExpression()
        +boolean evaluateCondition(JSON context)
    }

    User <|-- Employee : extends
    User <|-- DepartmentManager : extends
    User <|-- FinanceStaff : extends
    User <|-- GeneralManager : extends
    User <|-- SystemAdmin : extends

    ApprovalType "1" --> "*" ApprovalRequest : defines
    ApprovalRequest "1" --> "*" ApprovalNode : contains
    ApprovalRequest "1" --> "*" Attachment : has
    ApprovalRequest "*" --> "1" User : submitted by
    ApprovalNode "*" --> "1" User : assigned to
    ApprovalNode "*" --> "1" ApprovalRequest : belongs to
    WorkflowEngine "1" --> "1" ApprovalRequest : processes
    WorkflowEngine "1" --> "1" ApprovalType : references
    WorkflowEngine "1" --> "*" ApprovalNodeDefinition : uses
    ApprovalType "1" --> "*" ApprovalNodeDefinition : defines
    User "1" --> "*" Notification : receives
    ApprovalRequest "1" --> "*" Notification : triggers
```


# Lab 1 – Artifact Registry

### Summary
Setup a registry to store `.zip` source code of harness functions.

### Outcome
Ready-to-use, cloud-native generic storage.

---

### Steps

1. From the left-hand menu, navigate to  
   **Projects → Select the project available**  
   ![](https://lh7-us.googleusercontent.com/docsz/AD_4nXfhuMykMsIHl-7FjliWssHc0uwRpdLdrnq7GkGAI0g6UBZM69F1zpQ8ZA8N_vMqjpoGFYFR_weJk7OtOGGa2bksIaS6BlktwytmuJ1THM3e8O6tDT18HYWwFyGUye8ubsrHBChI8ORrCQ88JcKWpLjQ0DsXDS0NSZrkfZ4RUQ?key=cRG2cvp_PHVW0KG2Gq6Y_A)

2. From the module selection menu, select **Artifact Registry**  
   <img width="744" height="510" alt="image" src="https://github.com/user-attachments/assets/aa438c8f-8ff1-4886-9105-281aba6ba0c6" />

3. Click **+ New Artifact Registry**, enter the following values, and then click **Create Registry**:

   | Field         | Value        | Notes                                            |
   | ------------- | ------------ | ------------------------------------------------ |
   | Registry Type | Generic      | This registry will be used to store `.zip` files |
   | Registry Name | project name | **Use the project ID as the registry name**      |

---

# Lab 2 – Build

### Summary
Setup a CI pipeline, including running source code tests, building the executable, and pushing the artifact to a remote repository.

### Outcome
A deployable artifact.

### Learning Objectives
- Configure a basic pipeline using Harness CIE  
- Build and deploy an artifact to a remote repository  
- Run unit tests to verify build success  

---

### Steps

1. From the module selection menu, select **Continuous Integration**.
2. From the left-hand menu, select **Pipelines**.
3. Click **+ Create a Pipeline**, then enter:

   | Field                                | Value    | Notes                                                               |
   | ------------------------------------ | -------- | ------------------------------------------------------------------- |
   | Name                                 | workshop |                                                                     |
   | How do you want to setup your pipeline | Inline   | Harness (not Git) will be the source of truth for the pipeline.     |

4. In Pipeline Studio, click **Add Stage**, select **Build**, and configure:

   | Input           | Value       | Notes |
   | --------------- | ----------- | ----- |
   | Stage Name      | Build       |       |
   | Clone Codebase  | Enabled     |       |
   | Repository Name | harnessrepo |       |

---

### Infrastructure

| Input          | Value | Notes |
| -------------- | ----- | ----- |
| Infrastructure | Cloud |       |

---

### Execution

#### Run Tests
- Add **Test Intelligence** step from the Step Library.

  | Input   | Value                              | Notes                                                                                   |
  | ------- | ---------------------------------- | --------------------------------------------------------------------------------------- |
  | Name    | Run Tests With Intelligence        |                                                                                         |
  | Command | `pip install pytest & cd ./python-tests` | Monorepo: need to navigate to the application subfolder.                                |

- Apply changes.

#### Build & Package
- Add step → **Use template** → Select **Build and Package Lambda**.  
- Provide a name:

  | Input | Value   | Notes                                                                 |
  | ----- | ------- | --------------------------------------------------------------------- |
  | Name  | package | **Important:** Use the exact name provided (referenced in later steps). |

- Save and run the pipeline with:

  | Input       | Value | Notes        |
  | ----------- | ----- | ------------ |
  | Branch Name | main  | Prepopulated |

---

# Lab 3 – DevSecOps

### Summary
The security team has implemented **Fortify** and **OWASP** scans in reusable templates.  
Policies enforce their inclusion to improve security posture.

![](https://lh7-us.googleusercontent.com/docsz/AD_4nXcLr5TGcKRWOjVgB_sCAHHEeLPyd6EBdnkt2-mq_imTkZbQMEwJD03Q1wZyhWqHxoCNIIYWJWlRbnZrvZn2pPYIwTzXlOGdhMDEgn-J2JnK7lVastmfpdwTqDHXjpP0DK3TgU1gM-Ec_0iZLicWV7KpgW2FdXUCcAtraDGaEz8hI3dpWGLXkg?key=cRG2cvp_PHVW0KG2Gq6Y_A)

### Learning Objectives
- Understand governance in the path to production  
- Reuse templates to simplify developer workflows  
- Implement DevSecOps practices with minimal effort  

---

### Steps

1. In the existing pipeline, within the **Build** stage, before **PushToDockerhub**, click **+** and add step → **Use template**.  
   ![](https://lh7-us.googleusercontent.com/docsz/AD_4nXeC5rTVxlk7DeZeU_cINwcKo6Nf2wVW9brQ9MiCEfppJwmU-uH3QcNZ53qTxhur57KeySksoDBg9EqjhgKOgAEDKon6iNz9cFxozBe9VZssV-t77VNo6t1zPUvm6e2NOZJDKncxd9c2GM4HE-h-L4cIOl4u6Uqx_azoKchMdg?key=cRG2cvp_PHVW0KG2Gq6Y_A)

2. Select **DevX Fortify Scan**, name it **Fortify**.
3. After **PushToDockerhub**, add another template step → Select **OWASP**, name it **OWASP**.
4. Save and run with:

   | Input       | Value | Notes |
   | ----------- | ----- | ----- |
   | Branch Name | main  |       |

5. After successful execution:  
   - Review results in **Security Tests** → vulnerabilities list.  
   - Navigate to the **Artifact Registry module** to review the deployed lambda package.  

   <img width="1405" height="464" alt="image" src="https://github.com/user-attachments/assets/f55aba9b-649c-4919-b3b1-9179c44dcf46" />

# Lab 4 – Continuous Deploy: Lambda Function

### Summary
Extend your existing pipeline to take the artifact built in the CI/Build stage and deploy it to an environment.

### Learning Objectives
- Add a second stage to an existing pipeline  
- Create a Lambda service  
- Incorporate an advanced deployment strategy (e.g., Canary)  
- Create custom Harness variables  
- Create an Input Set  

---

### Steps

1. In the existing pipeline, add a **Deployment** stage:  
   - Click **Add Stage** → Select **Deploy**.

2. Enter the following values and click **Set Up Stage**:

   | Input           | Value       | Notes |
   | --------------- | ----------- | ----- |
   | Stage Name      | Lambda      |       |
   | Deployment Type | AWS Lambda  |       |

---

### Service

- Click **+ Add Service** and configure:

  | Field | Value          | Notes |
  | ----- | -------------- | ----- |
  | Name  | lambda_service |       |

- **+ Add AWS Lambda Function Definition**

  | Field                           | Value                           | Notes                                    |
  | ------------------------------- | ------------------------------- | ---------------------------------------- |
  | AWS Lambda Function Definition Store | Harness                         |                                          |
  | Manifest Identifier             | function_zip                    |                                          |
  | File/Folder Path                | **Select the lambda definition file** | Notice it is parameterized               |

- **+ Add Artifact Source**

  | Input                    | Value                                                                                   | Notes |
  | ------------------------ | --------------------------------------------------------------------------------------- | ----- |
  | Artifact Repository Type | Artifact Registry                                                                       |       |
  | Artifact Source Identifier | lambda                                                                                  |       |
  | Registry                 | **Select the registry with your project ID** (created in Lab 1)                         |       |
  | Image Name               | lambda                                                                                  |       |
  | Version                  | `<+pipeline.stages.Build.spec.execution.steps.package.output.outputVariables.output_folder>` | Validate naming conventions carefully |
  | File Name                | `<+pipeline.stages.Build.spec.execution.steps.package.output.outputVariables.output_file>` | Validate naming conventions carefully |

- Save and continue.

---

### Environment

- For target infrastructure, point to the AWS account used for the workshop.  
- Select **prod** environment:

  | Input | Value | Notes |
  | ----- | ----- | ----- |
  | Name  | prod  | Select environment and infrastructure definition |

- Select **aws-workshop** infrastructure:

  | Input | Value        | Notes |
  | ----- | ------------ | ----- |
  | Name  | aws-workshop |       |

- Continue.

---

### Execution Strategy

- Select **Canary** → Click **Use Strategy**.

---

# Lab 5 – Continuous Deploy: Access the Function

### Summary
Extend your pipeline to integrate with Terraform.

### Learning Objectives
- Use complex deployment strategies and integrations for end-to-end deployment.

---

### Steps

1. In the **lambda** stage, between **Canary Deploy** and **Traffic Shift**, add a template:  
   <img width="853" height="222" alt="image" src="https://github.com/user-attachments/assets/15233771-fc0a-4343-a777-921b3b3cafb9" />

2. Select **TF lambda function URL** template → Click **Use Template**:

   | Input | Value               | Notes |
   | ----- | ------------------- | ----- |
   | Name  | lambda_function_url |       |

3. Save and run the pipeline.  
4. After the pipeline passes the Terraform step, view the executed step’s **output** to find the function URL.  
5. Navigate to the URL and check for the promotion 🎉.

---

# Lab 6 – Governance / Policy as Code

### Summary
Create and apply policies as code for governance and self-service.  
(Lab 2 showed the effect of policies; now you will create them.)

### Learning Objectives
- Create a policy that evaluates when editing pipelines  
- Create a policy that evaluates during execution  
- Test policy enforcement  

---

### Steps

#### Create a Policy to Require Approvals

1. From the secondary menu, go to **Project Settings → Governance Policies**.
2. Click **Build a Sample Policy**.  
3. Select **Pipeline – Approval** → Click **Next**.  
4. Click **Next: Enforce Policy**.  
5. Configure:

   | Input            | Value        | Notes |
   | ---------------- | ------------ | ----- |
   | Trigger Event    | On Run       |       |
   | Failure Strategy | Error & exit |       |

---

#### Test the Policy

1. Open your pipeline.  
2. Attempt to run it — it should fail due to missing approval stage.

---

# Lab 7 – Validate the Canary

### Learning Objectives
- Identify traffic differences between normal and canary instances  
- Use deployment strategies to reduce blast radius  

**Bonus**:
- Add approval to slow down canary transition  
- Change traffic shift to 40%  
- During the shift, navigate to the URL and find the canary using the UI  

---

### Steps

1. Open the pipeline in edit mode → Navigate to **lambda** stage.  
2. Between traffic shift steps, add a **Harness Approval** step:

   | Input            | Value            | Notes |
   | ---------------- | ---------------- | ----- |
   | Step Name        | Approval         |       |
   | Type of Approval | Harness Approval |       |

3. Configure Approval:

   | Input       | Value             | Notes |
   | ----------- | ----------------- | ----- |
   | Name        | Approval          |       |
   | User Groups | All Project Users |       |

4. Save and run the pipeline.  
5. While traffic is shifting, navigate to the function URL and validate the canary.  
   - Take a screenshot and share with the Harness Team.  

---

# Lab 8 – Governance / Policy as Code (Advanced)

### Summary
Block critical CVEs with a custom policy.

---

### Steps

1. From the secondary menu: **Project Settings → Policies**.  
2. Select the **Policies** tab.  
3. Click **+ New Policy** → Name it **Runtime OWASP CVEs** → Apply.  
4. Add the following rego:

   ```rego
   package pipeline_environment
   deny[sprintf("Node OSS Can't contain any critical vulnerability '%d'", [input.NODE_OSS_CRITICAL_COUNT])] {
       input.NODE_OSS_CRITICAL_COUNT != 0
   }


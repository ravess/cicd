package com.tms.a1.dao;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.tms.a1.entity.Application;
import com.tms.a1.entity.Plan;
import com.tms.a1.entity.Task;
import com.tms.a1.utils.HibernateUtil;

import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;

@Component
public class TmsDAO {
    @Autowired
    private HibernateUtil hibernateUtil;

    // Check for existing App
    public Boolean existByAppAcronym(String appacronym) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            String hql = "FROM Application a WHERE a.appAcronym = :appacronym ";
            TypedQuery<Application> query = session.createQuery(hql, Application.class)
                    .setParameter("appacronym", appacronym);

            List<Application> resultList = query.getResultList();
            if (!resultList.isEmpty()) {
                Boolean result = true; // Get the first result
                transaction.commit();
                return result;
            } else {
                transaction.commit();
                return false;
            }
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return null;
        }
    }

    //Get All Apps
    public List<Application> findAllApps() {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            // save the User object
            Query query = session.createQuery("FROM Application", Application.class);
            List<Application> apps = query.getResultList();
            // commit transaction
            transaction.commit();
            return apps;
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return null;
        } finally {

        }
    }

    //Get Single App
    public Application findByApp(String appacronym) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            String hql = "FROM Application a WHERE a.appAcronym = :appacronym ";
            TypedQuery<Application> query = session.createQuery(hql, Application.class)
                    .setParameter("appacronym", appacronym);

            List<Application> resultList = query.getResultList();
            if (!resultList.isEmpty()) {
                Application result = resultList.get(0); // Get the first result
                transaction.commit();
                return result;
            } else {
                transaction.commit();
                return null;
            }
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return null;
        }
    }

    // Create new / Update App
    public void saveApp(Application app) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            Application detachedApp = app;
            Application managedApp = session.merge(detachedApp);
            // save the Group object
            session.persist(managedApp);
            // commit transaction
            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            throw e;
        }
    }

    // Check for existing Plan
    public Boolean existByPlanMVPName(String planmvpname) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            String hql = "FROM Plan p WHERE p.planMVPName = :planmvpname ";
            TypedQuery<Plan> query = session.createQuery(hql, Plan.class)
                    .setParameter("planmvpname", planmvpname);

            List<Plan> resultList = query.getResultList();
            if (!resultList.isEmpty()) {
                Boolean result = true; // Get the first result
                transaction.commit();
                return result;
            } else {
                transaction.commit();
                return false;
            }
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return null;
        }
    }

    //Get All Plans
    public List<Plan> findAllPlans(String appacronym) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            // save the User object
            String hql = "FROM Plan p WHERE p.planAppAcronym = :appacronym ";
            TypedQuery<Plan> query = session.createQuery(hql, Plan.class)
                .setParameter("appacronym", appacronym);
            List<Plan> plans = query.getResultList();
            // commit transaction
            transaction.commit();
            return plans;
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return null;
        }
    }

    //Get single Plan
    public Plan findByPlan(String planid, String appacronym) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            String hql = "FROM Plan p WHERE p.planMVPName = :planid AND p.planAppAcronym = :appacronym";
            TypedQuery<Plan> query = session.createQuery(hql, Plan.class)
                    .setParameter("planid", planid)
                    .setParameter("appacronym", appacronym);

            List<Plan> resultList = query.getResultList();
            if (!resultList.isEmpty()) {
                Plan result = resultList.get(0); // Get the first result
                transaction.commit();
                return result;
            } else {
                transaction.commit();
                return null;
            }
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return null;
        }
    }
    
    // Create/Update new Plan
    public void savePlan(Plan plan) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            Plan detachedPlan = plan;
            Plan managedPlan = session.merge(detachedPlan);
            // save the Group object
            session.persist(managedPlan);
            // commit transaction
            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            throw e;
        }
    }

     // Check for existing Task
    public Boolean existByTaskID(String taskid) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            String hql = "FROM Task t WHERE t.taskID = :taskid ";
            TypedQuery<Task> query = session.createQuery(hql, Task.class)
                    .setParameter("taskid", taskid);

            List<Task> resultList = query.getResultList();
            if (!resultList.isEmpty()) {
                Boolean result = true; // Get the first result
                transaction.commit();
                return result;
            } else {
                transaction.commit();
                return false;
            }
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return null;
        }
    }
    

    //Get All Tasks
    public List<Task> findAllTasks(String appacronym) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            // save the User object
            String hql = "FROM Task t WHERE t.taskAppAcronym = :appacronym ";
            TypedQuery<Task> query = session.createQuery(hql, Task.class)
                    .setParameter("appacronym", appacronym);
            List<Task> tasks = query.getResultList();
            // commit transaction
            transaction.commit();
            return tasks;
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return null;
        }
    }
    
     //Get single Task
     public Task findByTask(String taskid, String appacronym) {
         Transaction transaction = null;
         try (Session session = hibernateUtil.getSessionFactory().openSession()) {
             // start a transaction
             transaction = session.beginTransaction();
             String hql = "FROM Task t WHERE t.taskID = :taskid AND t.taskAppAcronym = :appacronym";
             TypedQuery<Task> query = session.createQuery(hql, Task.class)
                     .setParameter("taskid", taskid)
                     .setParameter("appacronym", appacronym);

             List<Task> resultList = query.getResultList();
             if (!resultList.isEmpty()) {
                 Task result = resultList.get(0); // Get the first result
                 transaction.commit();
                 return result;
             } else {
                 transaction.commit();
                 return null;
             }
         } catch (Exception e) {
             if (transaction != null) {
                 transaction.rollback();
             }
             e.printStackTrace();
             return null;
         }
     }
    
    // Create/Update new Plan
    public void saveTask(Task task) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            Task detachedTask = task;
            Task managedTask = session.merge(detachedTask);
            // save the Group object
            session.persist(managedTask);
            // commit transaction
            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            throw e;
        }
    }

    public List<String> getPermit(String app, String state) {
         Transaction transaction = null;
         try (Session session = hibernateUtil.getSessionFactory().openSession()) {
             // start a transaction
             transaction = session.beginTransaction();
             String columnName = "appPermit" + state;
             String hql = "SELECT a." + columnName +" FROM Application a WHERE a.appAcronym = :app";
             Query query = session.createQuery(hql, String.class)
                     .setParameter("app", app);
             List<String> result = query.getResultList();
             // commit transaction
 
             transaction.commit();
             return result;
         } catch (Exception e) {
             if (transaction != null && transaction.isActive()) {
                 transaction.rollback();
             }
             e.printStackTrace();
             return null;
         }
     }
}

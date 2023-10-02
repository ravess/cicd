package com.tms.a1.dao;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.tms.a1.entity.User;
import com.tms.a1.utils.HibernateUtil;

import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;
// import lombok.AllArgsConstructor;
@Component
public class UserDAO {

    @Autowired
    private HibernateUtil hibernateUtil;

    public User findByUsername(String username) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            String hql = "FROM User u WHERE u.username = :username ";
            TypedQuery<User> query = session.createQuery(hql, User.class)
                .setParameter("username", username);

            List<User> resultList = query.getResultList();
            if (!resultList.isEmpty()) {
                User result = resultList.get(0); // Get the first result
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

    public void getUserById(int id) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();

            // Obtain an entity using byId() method
            User User = session.byId(User.class).getReference(id);

            // commit transaction
            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
        }
    }

    public List<User> findAll() {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            // save the User object
            Query query = session.createQuery("FROM User", User.class);
            List<User> users = query.getResultList();
            // commit transaction
            transaction.commit();
            return users;
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return null;
        }
    }

    public List<?> checkgroup(String username, String usergroup) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            String hql = "SELECT u.username FROM User u WHERE u.username = :username AND u.groups LIKE :userGroupPattern";
            Query query = session.createQuery(hql, String.class)
                    .setParameter("username", username)
                    .setParameter("userGroupPattern", "%." + usergroup + ".%");
            List<?> result = query.getResultList();
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

    public Boolean checkgroup2(String username, String usergroup) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            String hql = "SELECT u.username FROM User u WHERE u.username = :username AND u.groups LIKE :userGroupPattern";
            Query query = session.createQuery(hql, String.class)
                    .setParameter("username", username)
                    .setParameter("userGroupPattern", "%." + usergroup + ".%");
            List<?> result = query.getResultList();
            // commit transaction
            transaction.commit();
            return !result.isEmpty(); // Return true if there is a result, false otherwise
        } catch (Exception e) {
            if (transaction != null && transaction.isActive()) {
                transaction.rollback();
            }
            e.printStackTrace();
            return false; // Return false in case of an exception
        }
    }


    public Boolean existByUsername(String username) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            String hql = "FROM User u WHERE u.username = :username ";
            TypedQuery<User> query = session.createQuery(hql, User.class)
                    .setParameter("username", username);

            List<User> resultList = query.getResultList();
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

    public void saveUser(User User) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            User detachedUser = User;
            User managedUser = session.merge(detachedUser);
            // save the Group object
            session.persist(managedUser);
            // commit transaction
            transaction.commit(); 
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
        }
    }

    public List<User> findEmail(String group) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            // save the User object
            String hql = "FROM User u WHERE u.groups LIKE :userGroupPattern";
            List<User> Users = session.createQuery(hql, User.class)
                    .setParameter("userGroupPattern", "%."+ group +".%")
                    .getResultList();
            // commit transaction
            transaction.commit();
            return Users;
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return null;
        }
    }
  
}

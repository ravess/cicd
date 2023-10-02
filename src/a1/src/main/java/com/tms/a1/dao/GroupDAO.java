package com.tms.a1.dao;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.tms.a1.entity.Group;
import com.tms.a1.utils.HibernateUtil;

import jakarta.persistence.Query;

@Component
public class GroupDAO {

    @Autowired
    private HibernateUtil hibernateUtil;

    public boolean existsByGroupName(String groupname) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();

            // get User entity using get() method
            String hql = "SELECT COUNT(g) FROM Group g WHERE g.groupName = :groupName";
            Long count = session.createQuery(hql,Long.class)
                .setParameter("groupName", groupname)
                .uniqueResult();
            transaction.commit();
            return count != null && count > 0;
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return false;
        }
    }

    
    public void save(Group group) {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();

            // Obtain an entity using byId() method
            session.persist(group);
         

            // commit transaction
            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
        }
    }

    public List<Group> findAll() {
        Transaction transaction = null;
        try (Session session = hibernateUtil.getSessionFactory().openSession()) {
            // start a transaction
            transaction = session.beginTransaction();
            // save the Group object
           Query query = session.createQuery("FROM Group", Group.class);
            List<Group> groups = query.getResultList();
            // commit transaction
            transaction.commit();
            return groups;
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();
            return null;
        }
    }

}
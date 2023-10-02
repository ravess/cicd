package com.tms.a1.utils;

import org.hibernate.SessionFactory;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.cfg.Configuration;
import org.hibernate.service.ServiceRegistry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.tms.a1.entity.Application;
import com.tms.a1.entity.Group;
import com.tms.a1.entity.Plan;
import com.tms.a1.entity.Task;
import com.tms.a1.entity.User;

@Component
public class HibernateUtil {

    @Value("${spring.datasource.username}")
    private String username;
    @Value("${spring.datasource.password}")
    private String password;
    @Value("${spring.datasource.url}")
    private String url;

    private static SessionFactory sessionFactory;

    public SessionFactory getSessionFactory() {
        if (sessionFactory == null) {
            try {
                Configuration configuration = new Configuration();

                // Database connection settings
                configuration.setProperty("hibernate.connection.driver_class", "com.mysql.cj.jdbc.Driver");
                configuration.setProperty("hibernate.connection.url", url);
                configuration.setProperty("hibernate.connection.username", username);
                configuration.setProperty("hibernate.connection.password", password);

                // Connection pool settings
                configuration.setProperty("hibernate.connection.pool_size", "10");

                // Show HQL statement in your terminal
                configuration.setProperty("hibernate.show_sql", "true");

                // Current session context
                configuration.setProperty("hibernate.current_session_context_class", "thread");
                configuration.setProperty("hibernate.hbm2ddl.auto", "validate");

                // dbcp connection pool configuration
                configuration.setProperty("hibernate.dbcp.initialSize", "5");
                configuration.setProperty("hibernate.dbcp.maxTotal", "20");
                configuration.setProperty("hibernate.dbcp.maxIdle", "10");
                configuration.setProperty("hibernate.dbcp.minIdle", "5");
                configuration.setProperty("hibernate.dbcp.maxWaitMillis", "-1");

                configuration.addAnnotatedClass(User.class);
                configuration.addAnnotatedClass(Group.class);
                configuration.addAnnotatedClass(Application.class);
                configuration.addAnnotatedClass(Task.class);
                configuration.addAnnotatedClass(Plan.class);
                ServiceRegistry serviceRegistry = new StandardServiceRegistryBuilder()
                        .applySettings(configuration.getProperties()).build();

                sessionFactory = configuration.buildSessionFactory(serviceRegistry);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return sessionFactory;
    }
}
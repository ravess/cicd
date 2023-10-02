package com.tms.a1.utils;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10); // Minimum number of threads to keep alive
        executor.setMaxPoolSize(20);  // Maximum number of threads to allow
        executor.setQueueCapacity(30); // Maximum number of tasks in the queue
        executor.initialize();
        return executor;
    }
}

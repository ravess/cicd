-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: localhost    Database: testdb
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `is_active` int NOT NULL,
  `groups` varchar(255) DEFAULT '.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (6,'bob','$2a$10$o.RHEuK9LyeYRH8Zp1jMx.3Rh9LmD39FaDkMU6xf1XGEYPAdwVTqi','bob@bob2.com',1,'.Admin.Dev.ProjectLead.ProjectManager.');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application`
--

DROP TABLE IF EXISTS `application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application` (
  `app_acronym` varchar(65) NOT NULL,
  `app_description` longtext NOT NULL,
  `app_rnumber` int unsigned NOT NULL,
  `app_start_date` varchar(65) DEFAULT NULL,
  `app_end_date` varchar(65) DEFAULT NULL,
  `app_permit_open` varchar(65) DEFAULT NULL,
  `app_permit_todolist` varchar(65) DEFAULT NULL,
  `app_permit_doing` varchar(65) DEFAULT NULL,
  `app_permit_done` varchar(65) DEFAULT NULL,
  `app_permit_create` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`app_acronym`),
  UNIQUE KEY `App_Acronym_UNIQUE` (`app_acronym`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application`
--

LOCK TABLES `application` WRITE;
/*!40000 ALTER TABLE `application` DISABLE KEYS */;
INSERT INTO `application` VALUES ('abc','abc123',57,'2023-08-25','2023-09-20','Admin','Admin','Admin','Admin','Admin');
/*!40000 ALTER TABLE `application` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groups` (
  `group_name` varchar(255) NOT NULL,
  UNIQUE KEY `groupName_UNIQUE` (`group_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groups`
--

LOCK TABLES `groups` WRITE;
/*!40000 ALTER TABLE `groups` DISABLE KEYS */;
INSERT INTO `groups` VALUES ('Admin'),('Dev'),('ProjectLead'),('ProjectManager');
/*!40000 ALTER TABLE `groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan`
--

DROP TABLE IF EXISTS `plan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan` (
  `plan_mvp_name` varchar(65) NOT NULL,
  `plan_start_date` varchar(65) DEFAULT NULL,
  `plan_end_date` varchar(65) DEFAULT NULL,
  `plan_app_acronym` varchar(65) NOT NULL,
  `plan_color` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`plan_mvp_name`,`plan_app_acronym`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan`
--

LOCK TABLES `plan` WRITE;
/*!40000 ALTER TABLE `plan` DISABLE KEYS */;
INSERT INTO `plan` VALUES ('emergency fix 1','','','zoo','#3d94d6'),('release 1','','','zoo','#ad4be2'),('release 2','','','zoo','#ff2e82'),('sprint ','2023-10-06','2023-10-19','asd','#000000'),('sprint 1','2023-10-05','2023-10-21','abc','#f22121'),('sprint 1','','','asd','#e31616'),('sprint 1','','','test','#de3f3f'),('sprint 1',NULL,NULL,'zoo','#ff6666'),('sprint 2','2023-10-05','2023-10-31','abc','#815cd6'),('sprint 2',NULL,NULL,'zoo','#04ff00'),('sprint 3','','','zoo','#ff0000');
/*!40000 ALTER TABLE `plan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task`
--

DROP TABLE IF EXISTS `task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task` (
  `task_id` varchar(65) NOT NULL,
  `task_name` varchar(65) NOT NULL,
  `task_description` longtext NOT NULL,
  `task_notes` longtext,
  `task_plan` varchar(65) DEFAULT NULL,
  `task_app_acronym` varchar(65) NOT NULL,
  `task_state` varchar(65) NOT NULL DEFAULT 'Open',
  `task_creator` varchar(65) NOT NULL,
  `task_owner` varchar(65) NOT NULL,
  `task_create_date` varchar(65) NOT NULL,
  PRIMARY KEY (`task_id`),
  UNIQUE KEY `Task_id_UNIQUE` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task`
--

LOCK TABLES `task` WRITE;
/*!40000 ALTER TABLE `task` DISABLE KEYS */;
INSERT INTO `task` VALUES ('abc_11','popcorn','eat popcorn','_____________________________________________________________________________\nPromoted by: test_owner222\nPromoted on: 2023-10-10 08:39:11 UTC\nState: [OPEN] >>> [TODO]\n','none','abc','OPEN','bob','bob','2023-07-31');
/*!40000 ALTER TABLE `task` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-10-11  8:37:22

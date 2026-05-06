--------------------------------------------------------
--  File created - Wednesday-May-06-2026   
--------------------------------------------------------
--------------------------------------------------------
--  DDL for Table COURSES
--------------------------------------------------------

  CREATE TABLE "CAMPUS_ADMIN"."COURSES" 
   (	"COURSE_CODE" VARCHAR2(20 BYTE), 
	"COURSE_NAME" VARCHAR2(100 BYTE), 
	"DEPARTMENT" VARCHAR2(100 BYTE)
   ) SEGMENT CREATION IMMEDIATE 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "USERS" ;
REM INSERTING into CAMPUS_ADMIN.COURSES
SET DEFINE OFF;
Insert into CAMPUS_ADMIN.COURSES (COURSE_CODE,COURSE_NAME,DEPARTMENT) values ('BSIT','Bachelor of Science in Information Technology','College of Computer Studies');
Insert into CAMPUS_ADMIN.COURSES (COURSE_CODE,COURSE_NAME,DEPARTMENT) values ('BSCS','Bachelor of Science in Computer Science','College of Computer Studies');
Insert into CAMPUS_ADMIN.COURSES (COURSE_CODE,COURSE_NAME,DEPARTMENT) values ('BSA','Bachelor of Science in Accountancy','College of Business and Accountancy');
Insert into CAMPUS_ADMIN.COURSES (COURSE_CODE,COURSE_NAME,DEPARTMENT) values ('BSEntrep','Bachelor of Science in Entrepreneurship','College of Business and Accountancy');
--------------------------------------------------------
--  DDL for Index SYS_C008270
--------------------------------------------------------

  CREATE UNIQUE INDEX "CAMPUS_ADMIN"."SYS_C008270" ON "CAMPUS_ADMIN"."COURSES" ("COURSE_CODE") 
  PCTFREE 10 INITRANS 2 MAXTRANS 255 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "USERS" ;
--------------------------------------------------------
--  Constraints for Table COURSES
--------------------------------------------------------

  ALTER TABLE "CAMPUS_ADMIN"."COURSES" ADD PRIMARY KEY ("COURSE_CODE")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "USERS"  ENABLE;

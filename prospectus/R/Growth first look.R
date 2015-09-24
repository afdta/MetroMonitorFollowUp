library("ggplot2")
library("reshape2")

setwd("/home/alec/Projects/metroIndex/prospectus/R/")
gmp <- read.csv("gmpRGDP.csv")
inc <- read.csv("RPI_MSA_2008_2013.csv")
emp <- read.csv("CA4_1969_2013_MSA.csv")

ftom <- function(v){
  vn <- as.numeric(as.character(v))
  return(vn)
}

gmp$X2008 <- ftom(gmp$X2008)
gmp$X2009 <- ftom(gmp$X2009)
gmp$X2010 <- ftom(gmp$X2010)
gmp$X2011 <- ftom(gmp$X2011)
gmp$X2012 <- ftom(gmp$X2012)
gmp$X2013 <- ftom(gmp$X2013)

emp2 <- emp[emp$LineCode==7010,]
gmp2 <- gmp[gmp$IndustryId==1,]
inc2 <- inc[inc$LineCode==1,]

grfn <- function(df, pre=NULL){
  n1 <- paste0(pre,"5yr")
  n2 <- paste0(pre,"3yr")
  n3 <- paste0(pre,"1yr")
  df[,n1] <- (df$X2013/df$X2008)-1
  df[,n2] <- (df$X2013/df$X2010)-1
  df[,n3] <- (df$X2013/df$X2012)-1
  return(df[,c("GeoFIPS", "GeoName", n1, n2, n3)])
}

emp3 <- grfn(emp2,"emp")
gmp3 <- grfn(gmp2,"gmp")
inc3 <- grfn(inc2,"inc")

m1 <- merge(emp3, gmp3, by=c("GeoFIPS"), incomparables=NA)
m2 <- merge(m1,inc3,by="GeoFIPS", incomparables=NA)

pairs(m2[,c(3:5,7:9,11:13)])
cor(m2[,c(3:5,7:9,11:13)])


sum(as.character(m2$GeoName.x)==as.character(m2$GeoName.y))
sum(as.character(m2$GeoName)==as.character(m2$GeoName.y))

melted <- melt(m2, id.vars=c("GeoFIPS","GeoName"), 
               measure.vars=c("emp5yr","emp3yr","emp1yr","gmp5yr","gmp3yr","gmp1yr","inc5yr","inc3yr","inc1yr"),
               variable.name="Metric")



gmp2[grep("Erie",gmp2$GeoName),]

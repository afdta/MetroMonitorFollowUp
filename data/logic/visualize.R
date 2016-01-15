overall <- rbind(GrRnk, ProRnk, IncRnk)
overall <- merge(metID, overall, by.x="CBSA_Code", by.y="CBSA")
overall$quintile <- cut(overall$Rank, breaks=c(0, 20, 40, 60, 80, 100), labels=c("First", "Second", "Third", "Fourth", "Fifth"))

table(overall$quintile, overall$Rank)

overall$orderByGrowth <- reorder(overall$Geo, overall$Score)

hm_theme <- theme_bw() + theme(panel.border = element_blank() ) + theme(axis.text.x=element_text(angle = 45, hjust = 1)) + theme(text=element_text(size=12), panel.grid.major = element_line(colour="#dddddd"))
pdf(file="~/Desktop/MMScores.pdf", width=11, height=8.5, useDingbats=FALSE)

#FIG 1
p <- ggplot(data=overall)
p + geom_tile(aes(x=Composite, y=Geo, fill=quintile)) + 
  scale_fill_manual(values=c('#2c7bb6','#abd9e9','#ffffbf','#fdae61','#d7191c')) + 
  facet_wrap(~ Year, ncol=3) +
  hm_theme

overall_wide <- dcast(overall, CBSA_Code + CBSA_Title + Geo ~ Composite + Year, value.var="Score")
names(overall_wide) <- gsub("-","_",names(overall_wide))

mat <- as.matrix(overall_wide[-1:-3])
source("https://raw.githubusercontent.com/briatte/ggcorr/master/ggcorr.R")

#FIGS 2&3
pairs(mat[,c(2,5,8)])
ggpairs(mat[,c(2,5,8)])
ggcorr(mat[,c(2,5,8)], label=TRUE, hjust=1, angle=-35, size=4)

underlying <- rbind(GrChg, ProChg100, IncChg100)
underlying_wide <- dcast(underlying, CBSA ~ year + indicator, value.var = "value")
names(underlying_wide) <- paste0("y", gsub("\\s+|-", "_", names(underlying_wide)))

underlying_wide_5yr <- underlying_wide[,c(1,11:19)]
names(underlying_wide_5yr) <-c("CBSA","AggWages", "AvgWage", "Emp", "EmpPop", "MedEarn", "GMP", "GMPJob", "GMPCap","RelPov")
#check names
data.frame(long=names(underlying_wide[,c(1,11:19)]), short=names(underlying_wide_5yr))
underlying_wide_5yr_ordered <- underlying_wide_5yr[c(1,4,7,2,8,9,3,5,6,10)]
underlying_wide_5yr_id <- merge(metID, underlying_wide_5yr_ordered, by.x="CBSA_Code", by.y="CBSA")
ifscale <- function(v){
  if(is.numeric(v)){
    return(scale(v))
  } else{
    return(v)
  }
}
underlying_std <- do.call(data.frame,lapply(underlying_wide_5yr_id, ifscale))
row.names(underlying_std) <- as.character(underlying_std$Geo)
underlying_std <- underlying_std[4:12]

#FIGS 4&5
#use standardized variables -- now beta on regression line is correlation coefficent

#ggpairs(underlying_wide_5yr_ordered, axisLabels="internal", size=3)
ggpairs(underlying_std, axisLabels="internal", size=3)
#ggcorr(underlying_wide_5yr_ordered, label=TRUE, hjust=1, size=4)
ggcorr(underlying_std, label=TRUE, hjust=1, size=4)

dev.off()

#why don't names match? -- truncation!
#nomatch <- overall[overall$CBSA.Name.df1!=overall$CBSA.Name.df2, c("CBSA.Name", "CBSA.Name.df1", "CBSA.Name.df2")]

#overall_melted <- melt(overall, id.vars=c("CBSA", "CBSA.Name", "Year"), measure.vars=c("Rank.df1", "Rank.df2", "Rank", "Score.df1", "Score.df2", "Score"))

#clustering (http://www.statmethods.net/advstats/cluster.html)

# Ward Hierarchical Clustering
distances <- dist(underlying_std, method = "euclidean") # distance matrix
fit <- hclust(distances, method="ward.D") 
plot(fit) # display dendogram
groups <- cutree(fit, k=5) # cut tree into 5 clusters
# draw dendogram with red borders around the 5 clusters 
rect.hclust(fit, k=5, border="red")

#K means
# Determine number of clusters
wss <- (nrow(underlying_std)-1)*sum(apply(underlying_std,2,var))
for (i in 2:15) wss[i] <- sum(kmeans(underlying_std, centers=i)$withinss)
plot(1:15, wss, type="b", xlab="Number of Clusters",ylab="Within groups sum of squares")

# K-Means Cluster Analysis
fit <- kmeans(underlying_std, 7) # 7 cluster solution
# get cluster means 
clusterMeans <- aggregate(underlying_std,by=list(fit$cluster),FUN=mean)
# append cluster assignment
mydata <- data.frame(underlying_std, cluster=fit$cluster)
clusters <- split(underlying_std, fit$cluster)
lapply(clusters, function(g){
  cat("CLUSTER MEANS\n")
  print(colMeans(g))
  cat(paste(nrow(g), "metro areas:\n"))
  cat(paste0(row.names(g), collapse="\n"))
  cat("\n\n")
})

#figure out some kind of grouping --- maybe just the high here, high there, high there...







##ggplotting
grgg <- ggplot(data=GRCHG_WIDE, aes(y=0))
grgg + geom_point(aes(x=Wages_FiveV),alpha=0.2)


organize <- function(code){
  #growth ranks/scores
  gr1 <- GrRnk[GrRnk$Year=="2013-2014" & GrRnk$CBSA==code, ]
  gr5 <- GrRnk[GrRnk$Year=="2009-2014" & GrRnk$CBSA==code, ]
  gr10 <- GrRnk[GrRnk$Year=="2004-2014" & GrRnk$CBSA==code, ]
  #growth values
  grch1 <- GrChg[GrChg$year=="2013-2014" & GrChg$CBSA==code, ]
  grch5 <- GrChg[GrChg$year=="2009-2014" & GrChg$CBSA==code, ]
  grch10 <- GrChg[GrChg$year=="2004-2014" & GrChg$CBSA==code, ]
  
  
  grOverall <- list(one=list(score=gr1[1,"Score"], rank=gr1[1,"Rank"]),
                    five=list(score=gr5[1,"Score"], rank=gr5[1,"Rank"]),
                    ten=list(score=gr10[1,"Score"], rank=gr10[1,"Rank"]))
  
  pro1 <- ProRnk[ProRnk$Year=="2013-2014" & ProRnk$CBSA==code, ]
  pro5 <- ProRnk[ProRnk$Year=="2009-2014" & ProRnk$CBSA==code, ]
  pro10 <- ProRnk[ProRnk$Year=="2004-2014" & ProRnk$CBSA==code, ]
  proOverall <- list(one=list(score=pro1[1,"Score"], rank=pro1[1,"Rank"]),
                     five=list(score=pro5[1,"Score"], rank=pro5[1,"Rank"]),
                     ten=list(score=pro10[1,"Score"], rank=pro10[1,"Rank"]))
  
  inc1 <- IncRnk[IncRnk$Year=="2013-2014" & IncRnk$CBSA==code, ]
  inc5 <- IncRnk[IncRnk$Year=="2009-2014" & IncRnk$CBSA==code, ]
  inc10 <- IncRnk[IncRnk$Year=="2004-2014" & IncRnk$CBSA==code, ]
  incOverall <- list(one=list(score=inc1[1,"Score"], rank=inc1[1,"Rank"]),
                     five=list(score=inc5[1,"Score"], rank=inc5[1,"Rank"]),
                     ten=list(score=inc10[1,"Score"], rank=inc10[1,"Rank"]))
  
  return(grch1)
}
ex <- list()
for(i in metID$CBSA_Code){
  
}



#testing
a<-data.frame(a=rnorm(100), b=rnorm(100))
a$aa <- (a$a-mean(a$a))/sd(a$a)
a$bb <- (a$b-mean(a$b))/sd(a$b)

cat("Unstandardized\n")
summary(lm(a~b, a))
cat("Standardized\n")
summary(lm(aa~bb, a))
# ARRAY OPERATIONS

# 1. Traversal of a 1D Array
array1D = [10, 20, 30, 40, 50]

print("===== 1D ARRAY =====")

for i in range(len(array1D)):
    print("Index:", i, "Value:", array1D[i])

print("Base address:", id(array1D))



# 2. Traversal of a 2D Array


array2D = [
    [10, 20, 30],
    [40, 50, 60],
    [70, 80, 90]
]

print("\n===== 2D ARRAY =====")

for i in range(len(array2D)):
    for j in range(len(array2D[i])):
        print("Row:", i, "Column:", j, "Value:", array2D[i][j])

print("Base address:", id(array2D))



# 3. Traversal of a 3D Array


array3D = [
    [
        [1, 2],
        [3, 4]
    ],
    [
        [5, 6],
        [7, 8]
    ]
]

print("\n===== 3D ARRAY =====")

for i in range(len(array3D)):
    for j in range(len(array3D[i])):
        for k in range(len(array3D[i][j])):
            print(
                "Layer:", i,
                "Row:", j,
                "Column:", k,
                "Value:", array3D[i][j][k]
            )

print("Base address:", id(array3D))


# 4. Merge Two 1D Arrays


arrayA = [10, 20, 30]
arrayB = [40, 50, 60]

mergedArray = arrayA + arrayB

print("\n===== MERGED ARRAY =====")

print("Array A:", arrayA)
print("Array B:", arrayB)
print("Merged Array:", mergedArray)


# 5. Find Minimum Value


def findMinimum(matrix):

    minimum = matrix[0][0]
    minRow = 0
    minColumn = 0

    for i in range(len(matrix)):
        for j in range(len(matrix[i])):

            if matrix[i][j] < minimum:
                minimum = matrix[i][j]
                minRow = i
                minColumn = j

    return minimum, minRow, minColumn



# 6. Find Maximum Value


def findMaximum(matrix):

    maximum = matrix[0][0]
    maxRow = 0
    maxColumn = 0

    for i in range(len(matrix)):
        for j in range(len(matrix[i])):

            if matrix[i][j] > maximum:
                maximum = matrix[i][j]
                maxRow = i
                maxColumn = j

    return maximum, maxRow, maxColumn


# 7. Test Minimum and Maximum Functions


matrix = [
    [10, 25, 5],
    [40, 15, 30],
    [20, 50, 35]
]

print("\n===== MINIMUM AND MAXIMUM =====")

minimum, minRow, minColumn = findMinimum(matrix)

maximum, maxRow, maxColumn = findMaximum(matrix)

print("Minimum value:", minimum)
print("Location: Row", minRow, "Column", minColumn)

print()

print("Maximum value:", maximum)
print("Location: Row", maxRow, "Column", maxColumn)